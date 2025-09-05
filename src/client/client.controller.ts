import { Controller, Delete, Get, Patch, Post } from "@nestjs/common";
import { ClientService } from './services/client.service';


@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    @Post('/clients')
    async creeateClient() {}

    @Get('/client')
    async getClient() {}

    @Get('/client/:id')
    async getClientById() {}

    @Patch('/client/:id')
    async updateClient() {}

    @Delete('/client/:id')
    async deleteClient() {}
    // soft delete, mark is_active to false

}