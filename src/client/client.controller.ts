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
import { CreateClientDto, SearchClientDto, UpdateClientDto } from 'src/types/dto/client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('trainer/:trainerId')
  async getClientsByTrainerId(@Param('trainerId') trainerId: string) {
    // Return Client[]
  }

  @Post('search-clients')
  async searchClients(@Body() body: SearchClientDto) {
    // Return Client[]
  }

  @Get(':id')
  async getClientById(@Param('id') clientId: string) {
    // return Client
  }

  @Post()
  async registerNewclient(@Body() createClientDto: CreateClientDto) {
    // return Client
  }

  @Patch(':id')
  async updateClient(
    @Param('id') clientId: string,
    @Body() updateData: UpdateClientDto,
  ) {
    // return Client
  }

  @Delete(':id')
  async decommisionClient(@Param('id') clientId: string) {
    // return { message: 'Client deleted successfully' }
  }

}
