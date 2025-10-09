import { Injectable, Logger } from '@nestjs/common';
import { KnexService } from '../../infra/database/knex.service';
import { CreateSessionDto, Session, UpdateSessionDto } from 'src/types/dto/session.dto';
import { SessionEntity } from 'src/types/db/session';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly knexService: KnexService) {}

  async getSessionsByTimeRange(trainerId: string, startRange: string, endRange: string): Promise<Session[]> {
    this.logger.debug(`Retrieving Sessions within ${startRange} to ${endRange}`);

    try {
      const sessionEntities: SessionEntity[] = await this.knexService
        .db('sessions as S')
        .join('clients as C', 'S.client_id', 'C.client_id')
        .join('users as U', 'S.client_id', 'U.id')
        .select(
          'S.id',
          'S.client_id',
          'U.first_name',
          'U.last_name',
          'U.email',
          'S.session_type',
          'S.start_time',
          'S.end_time',
          'S.description'
        )
        .where('S.trainer_id', trainerId)
        .where('S.start_time', '>=', startRange)
        .where('S.end_time', '<=', endRange);
      
      const result: Session[] = sessionEntities.map(s => {
        return {
          id: s.id,
          client_id: s.client_id,
          client_name: `${s.first_name} ${s.last_name}`,
          client_email: s.email,
          session_type: s.session_type,
          start_date: s.start_time,
          end_date: s.end_time,
          description: s.description
          }
      });
      
      return result;
    } catch (error) {
      this.logger.error('Error fetching sessions by time range', error);
      return [];
    }
  }

  async getSessionById(sessionId: string): Promise<Session> {
    this.logger.debug(`Retrieving Session by ID: ${sessionId}`);
    try {
      const session: SessionEntity = await this.knexService
        .db('sessions as S')
        .join('users as U', 'S.client_id', 'U.id')
        .select(
          'S.id',
          'S.client_id',
          'U.first_name',
          'U.last_name',
          'U.email',
          'S.session_type',
          'S.start_time',
          'S.end_time',
          'S.description'
        )
        .where('S.id', sessionId)
        .first();
      
      const result: Session = {
        id: session.id,
        client_id: session.client_id,
        client_name: `${session.first_name} ${session.last_name}`,         
        client_email: session.email, 
        session_type: session.session_type,
        start_date: session.start_time,
        end_date: session.end_time,
        description: session.description
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching session by ID', error);
      throw error;
    }
  }

  async createNewSession(createSession: CreateSessionDto): Promise<Session> {
    try {

      const existingClient = await this.knexService
        .db('clients')
        .where('client_id', createSession.client_id)
        .first();
      
      if (!existingClient) {
        this.logger.warn(`Client with ID ${createSession.client_id} does not exist`);
        throw new Error('Client does not exist');
      }

      const conflictingSessions = await this.knexService
        .db('sessions')
        .where('start_time', '<', createSession.end_time)
        .where('end_time', '>', createSession.start_time)
      
      if (conflictingSessions.length > 0) {
        this.logger.warn(`Session conflict detected for client ID ${createSession.client_id}`);
        throw new Error('Session time conflict');
      }

      const [firstName, lastName] = createSession.client_name.split(' ');

      const dbSession = {
        client_id: createSession.client_id,
        first_name: firstName,
        last_name: lastName,
        email: createSession.client_email,
        session_type: createSession.session_type,
        start_time: new Date(createSession.start_time),
        end_time: new Date(createSession.end_time),
        description: createSession.description,
      };

      const newSession: Session[] = await this.knexService
        .db('sessions')
        .insert(dbSession)
        .returning('*');

      return newSession[0];
    } catch (error) {
      this.logger.error('Error creating new session', error);
      throw error;
    }
  }

  async updateSession(sessionId: string, updateData: UpdateSessionDto): Promise<Session> {
    try {

      const startTime = updateData.start_time ?? undefined;
      const endTime = updateData.end_time ?? undefined;

      const dbSession = {
        session_type: updateData.session_type,
        start_time: startTime,
        end_time: endTime,
        description: updateData.description,
      };

      const updatedSession: Session[] = await this.knexService
        .db('sessions')
        .where('id', sessionId)
        .update(dbSession)
        .returning('*');


      return updatedSession[0];
    } catch (error) {
      this.logger.error('Error updating session', error);
      throw error;
    }
  }

  async cancelSession(sessionId: string): Promise<{ message: string }> {
    try {
      await this.knexService
        .db('sessions')
        .where('id', sessionId)
        .del();
      return { message: 'Session deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting session', error);
      throw error;
    }
  }

}
