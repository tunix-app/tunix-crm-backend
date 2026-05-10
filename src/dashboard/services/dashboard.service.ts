import { Injectable, Logger } from '@nestjs/common';
import { KnexService } from 'src/infra/database/knex.service';
import {
  CoachDashboardDto,
  DashboardSessionDto,
  UnscheduledClientDto,
} from 'src/types/dto/dashboard.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly knexService: KnexService) {}

  async getDashboard(
    trainerId: string,
    date?: string,
  ): Promise<CoachDashboardDto> {
    const [sessionsToday, activeClientCount, unscheduledClients] =
      await Promise.all([
        this.getSessionsToday(trainerId, date),
        this.getActiveClientCount(trainerId),
        this.getUnscheduledClients(trainerId),
      ]);

    return {
      total_sessions_today: sessionsToday.length,
      total_active_clients: activeClientCount,
      sessions_today: sessionsToday,
      unscheduled_clients: unscheduledClients,
    };
  }

  private getDateBounds(date?: string): { start: Date; end: Date } {
    const base = date ? new Date(`${date}T00:00:00.000Z`) : new Date();
    const start = new Date(
      Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()),
    );
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
    return { start, end };
  }

  private async getSessionsToday(
    trainerId: string,
    date?: string,
  ): Promise<DashboardSessionDto[]> {
    this.logger.debug(
      `Fetching sessions for trainer ${trainerId} on date ${date ?? 'today'}`,
    );
    const { start, end } = this.getDateBounds(date);

    const rows = await this.knexService
      .db('sessions as s')
      .join('users as u', 'u.id', 's.client_id')
      .select(
        's.id',
        's.client_id',
        this.knexService.db.raw(
          "u.first_name || ' ' || u.last_name AS client_name",
        ),
        's.session_type',
        's.start_time',
        's.end_time',
        this.knexService.db.raw(
          'ROUND(EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 60)::int AS duration_minutes',
        ),
        's.description',
      )
      .where('s.trainer_id', trainerId)
      .andWhere('s.start_time', '>=', start)
      .andWhere('s.start_time', '<=', end)
      .orderBy('s.start_time', 'asc');

    return rows.map(
      (row): DashboardSessionDto => ({
        id: row.id,
        client_id: row.client_id,
        client_name: row.client_name,
        session_type: row.session_type,
        start_time:
          row.start_time instanceof Date
            ? row.start_time.toISOString()
            : row.start_time,
        end_time:
          row.end_time instanceof Date
            ? row.end_time.toISOString()
            : row.end_time,
        duration_minutes: row.duration_minutes,
        description: row.description ?? null,
      }),
    );
  }

  private async getActiveClientCount(trainerId: string): Promise<number> {
    this.logger.debug(`Counting active clients for trainer ${trainerId}`);
    const result = await this.knexService
      .db('clients')
      .count('* as count')
      .where('trainer_id', trainerId)
      .andWhere('is_active', true)
      .first();

    return Number(result?.count ?? 0);
  }

  private async getUnscheduledClients(
    trainerId: string,
  ): Promise<UnscheduledClientDto[]> {
    this.logger.debug(`Fetching unscheduled clients for trainer ${trainerId}`);
    const rows = await this.knexService
      .db('clients as c')
      .join('users as u', 'u.id', 'c.client_id')
      .leftJoin('sessions as s', function () {
        this.on('s.client_id', '=', 'c.client_id').andOn(
          's.trainer_id',
          '=',
          'c.trainer_id',
        );
      })
      .select(
        'c.id',
        'c.client_id',
        this.knexService.db.raw(
          "u.first_name || ' ' || u.last_name AS client_name",
        ),
        'u.email as client_email',
        this.knexService.db.raw('MAX(s.start_time) AS last_session'),
      )
      .where('c.trainer_id', trainerId)
      .andWhere('c.is_active', true)
      .groupBy('c.id', 'c.client_id', 'u.first_name', 'u.last_name', 'u.email')
      .havingRaw('COUNT(CASE WHEN s.start_time > NOW() THEN 1 END) = 0')
      .orderBy('client_name', 'asc');

    return rows.map(
      (row): UnscheduledClientDto => ({
        id: row.id,
        client_id: row.client_id,
        client_name: row.client_name,
        client_email: row.client_email,
        last_session:
          row.last_session != null
            ? row.last_session instanceof Date
              ? row.last_session.toISOString()
              : row.last_session
            : null,
      }),
    );
  }
}
