import { Controller } from "@nestjs/common";
import { ClientService } from './services/client.service';


@Controller('client')
export class ClientController {
    constructor(private readonly clientService: ClientService) {}

    // GET, PUT, PATCH
}