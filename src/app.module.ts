import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KnexModule } from './infra/database/knex.module';
import { SupabaseModule } from './infra/supabase/supabase.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { SessionModule } from './session/session.module';
import { NoteModule } from './note/note.module';
import { WaiverModule } from './waiver/waiver.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    KnexModule,
    SupabaseModule,
    HealthModule,
    AuthModule,
    UserModule,
    ClientModule,
    SessionModule,
    NoteModule,
    WaiverModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
