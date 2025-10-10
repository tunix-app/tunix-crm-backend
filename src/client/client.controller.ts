import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ClientService } from './services/client.service';
import {
  Client,
  CreateClientDto,
  SearchClientDto,
  UpdateClientDto,
} from 'src/types/dto/client.dto';
import { ClientEntity } from 'src/types/db/client';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('trainer/:trainerId')
  async getClientsByTrainerId(@Param() params: any): Promise<Client[]> {
    return await this.clientService.getClientsByTrainerId(params.trainerId);
  }

  @Post('search-clients')
  async searchClients(@Body() body: SearchClientDto): Promise<Client[]> {
    return await this.clientService.searchClients(body.query);
  }

  @Get(':id')
  async getClientById(@Param() params: any): Promise<Client> {
    return await this.clientService.getClientById(params.id);
  }

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

  @Patch(':id')
  async updateClient(
    @Param() params: any,
    @Body() updateData: UpdateClientDto,
  ): Promise<Client> {
    return await this.clientService.updateClient(params.id, updateData);
  }

  @Delete(':id')
  async decommisionClient(@Param() params: any): Promise<{ message: string }> {
    return await this.clientService.decommissionClient(params.id);
  }
}
