import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from './infra/database/knex.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    KnexModule, 
    HealthModule, 
    AuthModule, 
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
