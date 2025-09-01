import { Module } from '@nestjs/common';
import { KnexModule } from 'src/infra/database/knex.module';
import { ClientController } from './client.controller';
import { ClientService } from './services/client.service';

@Module({
    imports: [
        KnexModule
    ],
    controllers: [
        ClientController
    ],
    providers: [
        ClientService
    ]
})
export class UserModule {}