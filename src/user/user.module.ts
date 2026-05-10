import { Module } from '@nestjs/common';
import { KnexModule } from 'src/infra/database/knex.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [KnexModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
