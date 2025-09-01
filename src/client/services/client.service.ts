import { Injectable, Logger } from "@nestjs/common";
import { KnexService } from "src/infra/database/knex.service";

@Injectable()
export class ClientService {
    private readonly logger = new Logger(ClientService.name);

    constructor(private readonly knexService: KnexService) {}


}