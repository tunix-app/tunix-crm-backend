import { Module } from '@nestjs/common';
import { KnexModule } from 'src/infra/database/knex.module';
import { SessionController } from './session.controller';
import { SessionService } from './services/session.service';

@Module({
  imports: [KnexModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
