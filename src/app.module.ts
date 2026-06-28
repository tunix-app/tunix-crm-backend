import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { KnexModule } from './infra/database/knex.module';
import { SupabaseModule } from './infra/supabase/supabase.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ClientModule } from './client/client.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SessionModule } from './session/session.module';
import { NoteModule } from './note/note.module';
import { WaiverModule } from './waiver/waiver.module';
import { ExerciseModule } from './exercise/exercise.module';
import { ProgramModule } from './program/program.module';

@Module({
  imports: [
    ConfigModule,
    KnexModule,
    SupabaseModule,
    HealthModule,
    AuthModule,
    UserModule,
    ClientModule,
    DashboardModule,
    SessionModule,
    NoteModule,
    WaiverModule,
    ExerciseModule,
    ProgramModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
