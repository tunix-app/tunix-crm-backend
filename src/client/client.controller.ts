import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientService } from './services/client.service';
import {
  CreateClientDto,
  SearchClientDto,
  UpdateClientDto,
} from 'src/types/dto/client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('trainer')
  async getClientsByTrainerId(@Query('trainerId') trainerId: string) {
    return await this.clientService.getClientsByTrainerId(trainerId);
  }

  @Post('search-clients')
  async searchClients(@Body() body: SearchClientDto) {
    return await this.clientService.searchClients(body.query);
  }

  @Get(':id')
  async getClientById(@Param('id') clientId: string) {
    return await this.clientService.getClientById(clientId);
  }

  @Post('/trainer/:trainerId')
  async registerNewclient(
    @Param() params: any,
    @Body() createClientDto: CreateClientDto,
  ) {
    return await this.clientService.createClient(
      params.trainerId,
      createClientDto,
    );
  }

  @Patch(':id')
  async updateClient(
    @Param() params: any,
    @Body() updateData: UpdateClientDto,
  ) {
    return await this.clientService.updateClient(params.id, updateData);
  }

  @Delete(':id')
  async decommisionClient(@Param() params: any) {
    return await this.clientService.decommissionClient(params.id);
  }
}
