import {
  BadRequestException,
  NotFoundException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { KnexService } from 'src/infra/database/knex.service';
import {
  Client,
  CreateClientDto,
  UpdateClientDto,
} from 'src/types/dto/client.dto';
import { ClientEntity } from 'src/types/db/client';

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly knexService: KnexService) {}

  async getClientsByTrainerId(trainerId: string): Promise<Client[]> {
    this.logger.debug(`Fetching clients for trainer ID: ${trainerId}`);
    try {
      const clients: ClientEntity[] = await this.knexService
        .db('clients as C')
        .join('users as U', 'C.client_id', 'U.id')
        .select(
          'C.id',
          'C.client_id',
          'U.first_name',
          'U.last_name',
          'U.email',
          'C.is_active',
          'C.last_session',
          'C.next_session',
          'C.current_program',
        )
        .where({ 'C.trainer_id': trainerId });

      const result: Client[] = clients.map((c) => {
        return {
          id: c.id,
          client_id: c.client_id,
          client_name: `${c.first_name} ${c.last_name}`,
          client_email: c.email,
          isActive: c.is_active,
          last_session: c.last_session,
          next_session: c.next_session,
          current_program: c.current_program,
        } as Client;
      });

      return result;
    } catch (error) {
      this.logger.error('Error fetching clients by trainer ID', error);
      return [];
    }
  }

  async searchClients(query: string): Promise<Client[]> {
    this.logger.debug(`Searching clients with query: ${query}`);
    try {
      const clients: ClientEntity[] = await this.knexService
        .db('clients as C')
        .join('users as U', 'C.client_id', 'U.id')
        .select(
          'C.id',
          'C.client_id',
          'U.first_name',
          'U.last_name',
          'U.email',
          'U.phone',
          'C.is_active',
          'C.last_session',
          'C.next_session',
          'C.current_program',
        )
        .where(function () {
          this.whereILike('U.first_name', `%${query}%`)
            .orWhereILike('U.last_name', `%${query}%`);
        });

      const result: Client[] = clients.map((c) => {
        return {
          id: c.id,
          client_id: c.client_id,
          client_name: `${c.first_name} ${c.last_name}`,
          client_email: c.email,
          isActive: c.is_active,
          last_session: c.last_session,
          next_session: c.next_session,
          current_program: c.current_program,
        } as Client;
      });

      return result;
    } catch (error) {
      this.logger.error('Error searching clients', error);
      return [];
    }
  }

  async createClient(
    trainerId: string,
    createClient: CreateClientDto,
  ): Promise<any> {
    /*
      Scenarios:
      non existing user, no existing mapping ==> create user and client mapping (new UUIDs)
      existing user, no existing mapping ==> create client mapping (new UUID for client table)
      existing user, existing mapping ==> throw error for now, look into future
        rework of remapping to a different trainer if the client is no longer active ==> TODO
      non existing user, existing mapping ==> not possible
    
    */
   this.logger.debug(`Creating client for trainer ID: ${trainerId}`);
    try {
      const [firstName, lastName] = createClient.client_name.split(' ');

      const existingUser = await this.knexService
        .db('users')
        .where('first_name', firstName)
        .andWhere('last_name', lastName)
        .orWhere('email', createClient.client_email)
        .first();

      this.logger.debug(`Existing user: ${JSON.stringify(existingUser)}`);

      let newclientId = '';

      if (existingUser) {
        const existingMapping = await this.knexService
          .db('clients')
          .where('client_id', existingUser.id)
          .first();

        this.logger.debug(`Existing mapping: ${JSON.stringify(existingMapping)}`);

        if (existingMapping) {
          this.logger.warn(
            `Client already mapped to trainer - ${existingMapping.trainer_id}`,
          );
          throw new BadRequestException('Client already mapped to a trainer');
        }


      } else {
        this.logger.debug(`Creating new user ${createClient.client_name}`);
        const newUserPhone = createClient?.client_phone || undefined;
        const newUser = {
          email: createClient.client_email,
          role: 'Client',
          first_name: firstName,
          last_name: lastName,
          phone: newUserPhone,
        };

        const insertResult =await this.knexService.db('users').insert(newUser).returning('*');
        newclientId = insertResult[0].id;
        this.logger.debug(`New user created with ID: ${newclientId}`);
      }

      const newClient = await this.knexService
        .db('clients')
        .insert({
          trainer_id: trainerId,
          client_id: newclientId,
          is_active: true,
          goals: createClient?.goals ?? undefined,
        })
        .returning('*');

      return { message: 'Client created successfully', client: newClient };
    } catch (error) {
      this.logger.error('Error creating client', error);
      throw new BadRequestException(error.message || 'Failed to create client');
    }
  }

  async getClientById(id: string): Promise<Client> {
    this.logger.debug(`Fetching client with ID: ${id}`);
    try {
      const client: ClientEntity = await this.knexService
        .db('clients as C')
        .join('users as U', 'C.client_id', 'U.id')
        .select(
          'C.id',
          'C.client_id',
          'U.first_name',
          'U.last_name',
          'U.email',
          'U.phone',
          'C.is_active',
          'C.last_session',
          'C.next_session',
          'C.current_program',
          'C.goals',
        )
        .where('C.id', id)
        .first();

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      return {
        id: client.id,
        client_id: client.client_id,
        client_name: `${client.first_name} ${client.last_name}`,
        client_email: client.email ?? '',
        isActive: client.is_active,
        last_session: client.last_session ?? new Date(''),
        next_session: client.next_session ?? new Date(''),
        current_program: client.current_program,
        goals: client.goals,
      };
    } catch (error) {
      this.logger.error('Error fetching client by ID', error);
      throw new NotFoundException(error.message || 'Client not found');
    }
  }

  async updateClient(
    id: string,
    updateClient: UpdateClientDto,
  ): Promise<Client> {
    try {
      const updateData = {
        current_program: updateClient.current_program,
        goals: updateClient.goals,
      };

      const result = await this.knexService
        .db('clients')
        .where('id', id)
        .update(updateData)
        .returning('*');

      if (result.length === 0) {
        throw new NotFoundException('Client not found');
      }

      const client: ClientEntity = await this.knexService
        .db('clients as C')
        .join('users as U', 'C.client_id', 'U.id')
        .select(
          'C.id',
          'C.client_id',
          'U.first_name',
          'U.last_name',
          'U.email',
          'U.phone',
          'C.is_active',
          'C.last_session',
          'C.next_session',
          'C.current_program',
          'C.goals',
        )
        .where('C.id', id)
        .first();

      return {
        id: client.id,
        client_id: client.client_id,
        client_name: `${client.first_name} ${client.last_name}`,
        client_email: client.email ?? '',
        isActive: client.is_active,
        last_session: client.last_session ?? new Date(''),
        next_session: client.next_session ?? new Date(''),
        current_program: client.current_program,
        goals: client.goals,
      };
    } catch (error) {
      this.logger.error('Error updating client', error);
      throw new BadRequestException('Failed to update client');
    }
  }

  async decommissionClient(id: string): Promise<any> {
    try {
      await this.knexService
        .db('clients')
        .where('id', id)
        .update({ is_active: false });

      this.logger.debug(`Client with ID: ${id} decommissioned`);
      return { message: 'Client decommissioned successfully' };
    } catch (error) {
      this.logger.error('Error decommissioning client', error);
      throw new BadRequestException('Failed to decommission client');
    }
  }
}
