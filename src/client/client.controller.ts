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
import { CreateClientDto } from './dto/client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  async createClient(@Body() createClient: CreateClientDto) {
    return this.clientService.createClient(createClient);
  }

  @Get(':id')
  async getClientById(@Param('id') id: string) {
    return this.clientService.getClientById(id);
  }

  @Patch(':id')
  async updateClient(@Param('id') id: string, @Body() updateData: any) {
    return this.clientService.updateClient(id, updateData);
  }

  @Delete(':id')
  async deleteClient(@Param('id') id: string) {
    return this.clientService.decommissionClient(id);
  }
  // soft delete, mark is_active to false
}
