import {
  BadRequestException,
  NotFoundException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { KnexService } from 'src/infra/database/knex.service';
import { CreateClientDto } from '../dto/client.dto';

const ALLOWED_COLUMNS = ['email', 'phone', 'first_name', 'last_name', 'notes'];

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);

  constructor(private readonly knexService: KnexService) {}

  async createClient(createClient: CreateClientDto) {
    // validate trainer_id if it exists as a field in users table
    const trainer = await this.knexService
      .db('users')
      .where({ id: createClient.trainer_id })
      .first();
    const clientMetadata = await this.knexService
      .db('users')
      .where({ id: createClient.client_id })
      .first();

    if (!trainer) {
      throw new BadRequestException(
        `Trainer with id ${createClient.trainer_id} does not exist`,
      );
    } else if (!clientMetadata) {
      throw new BadRequestException(
        `Client with id ${createClient.client_id} does not exist`,
      );
    } else {
      const newClient = await this.knexService
        .db('clients')
        .insert(createClient)
        .returning('*');
      if (!newClient) {
        throw new BadRequestException('Failed to create client');
      }
      return newClient[0];
    }
  }

  async getClientById(id: string) {
    const client = await this.knexService.db('clients').where({ id }).first();
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`);
    }
    return client;
  }

  async updateClient(id: string, updateData: any) {
    this.logger.log(`Inside update client logic`);
    // Filter out keys not in allowed columns
    const filteredData: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      if (ALLOWED_COLUMNS.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      this.logger.error(
        `provided request body does not contain columns from users table`,
      );
      throw new BadRequestException('No valid fields to update');
    }

    // Optionally update the updated_at timestamp
    filteredData.updated_at = new Date();

    await this.knexService.db('clients').where({ id }).update(filteredData);
    return this.getClientById(id);
  }

  async decommissionClient(id: string) {
    this.logger.log(`Inside decommission client logic`);
    const updateData = {
      is_active: false,
      updated_at: new Date(),
    };

    await this.knexService.db('clients').where({ id }).update(updateData);
    return this.getClientById(id);
  }
}
