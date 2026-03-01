import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ClientService } from './services/client.service';
import {
  Client,
  CreateClientDto,
  SearchClientDto,
  UpdateClientDto,
} from 'src/types/dto/client.dto';
import { ClientEntity } from 'src/types/db/client';

@ApiTags('Clients')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({ summary: 'Get all clients for a trainer' })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID' })
  @Get('trainer/:trainerId')
  async getClientsByTrainerId(@Param() params: any): Promise<Client[]> {
    return await this.clientService.getClientsByTrainerId(params.trainerId);
  }

  @ApiOperation({ summary: 'Search clients by name or email' })
  @Post('search-clients')
  async searchClients(@Body() body: SearchClientDto): Promise<Client[]> {
    return await this.clientService.searchClients(body.query);
  }

  @ApiOperation({ summary: 'Get a client by ID' })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @Get(':id')
  async getClientById(@Param() params: any): Promise<Client> {
    return await this.clientService.getClientById(params.id);
  }

  @ApiOperation({ summary: 'Register a new client under a trainer' })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID' })
  @Post('/trainer/:trainerId')
  async registerNewclient(
    @Param() params: any,
    @Body() createClientDto: CreateClientDto,
  ): Promise<{ message: string; client: ClientEntity[] }> {
    return await this.clientService.createClient(
      params.trainerId,
      createClientDto,
    );
  }

  @ApiOperation({ summary: 'Update a client by ID' })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @Patch(':id')
  async updateClient(
    @Param() params: any,
    @Body() updateData: UpdateClientDto,
  ): Promise<Client> {
    return await this.clientService.updateClient(params.id, updateData);
  }

  @ApiOperation({ summary: 'Decommission (soft-delete) a client by ID' })
  @ApiParam({ name: 'id', description: 'Client UUID' })
  @Delete(':id')
  async decommisionClient(@Param() params: any): Promise<{ message: string }> {
    return await this.clientService.decommissionClient(params.id);
  }
}
