import { Injectable, Logger } from '@nestjs/common';
import { KnexService } from '../../infra/database/knex.service';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(private readonly knexService: KnexService) {}

  async createSession(sessionData: any): Promise<any> {
    const newSession = await this.knexService
      .db('sessions')
      .insert(sessionData)
      .returning('*');

    return newSession;
  }

  async getSessionsByClientId(clientId: string): Promise<any[]> {
    const sessions = await this.knexService
      .db('sessions')
      .where({ client_id: clientId });

    return sessions;
  }

  async updateSession(sessionId: string, updateData: any): Promise<any> {
    const updatedSession = await this.knexService
      .db('sessions')
      .where({ id: sessionId })
      .update(updateData)
      .returning('*');

    return updatedSession;
  }
}
