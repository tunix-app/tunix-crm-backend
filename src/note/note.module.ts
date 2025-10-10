import { Module } from '@nestjs/common';
import { KnexModule } from 'src/infra/database/knex.module';
import { NoteController } from './note.controller';
import { NoteService } from './services/note.service';

@Module({
  imports: [KnexModule],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
