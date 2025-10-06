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
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  async createClient(@Body() createClient: CreateClientDto) {
    return this.clientService.createClient(createClient);
  }

  @Get(':id')
  async getClientById(@Param('clientId') clientId: string) {
    return this.clientService.getClientById(clientId);
  }

  // Get all clients for a specific user id
  @Get('/trainer/:trainerId')
  async getAllActiveClients(@Param('trainerId') trainerId: string) {
    return this.clientService.getClientsByTrainerId(trainerId);
  }

  @Patch(':id')
  async updateClient(
    @Param('clientId') clientId: string,
    @Body() updateData: UpdateClientDto,
  ) {
    return this.clientService.updateClient(clientId, updateData);
  }

  @Delete(':id')
  async decommissionClient(@Param('clientId') clientId: string) {
    return this.clientService.decommissionClient(clientId);
  }
  // soft delete, mark is_active to false
}
