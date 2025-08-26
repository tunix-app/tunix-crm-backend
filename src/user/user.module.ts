import { Module } from '@nestjs/common';
import { KnexModule } from 'src/infra/database/knex.module';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';

@Module({
    imports: [
        KnexModule
    ],
    controllers: [
        UserController
    ],
    providers: [
        UserService
    ]
})
export class UserModule {}
