import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { KnexModule } from './infra/database/knex.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule,
    KnexModule,
    HealthModule,
  ],
})
export class AppModule {}
