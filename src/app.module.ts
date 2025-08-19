import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from './infra/database/knex.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), KnexModule, HealthModule, AuthModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
