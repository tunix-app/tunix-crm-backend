import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { NoteService } from './services/note.service';
import { CreateNoteDto, UpdateNoteDto } from 'src/types/dto/note.dto';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Get('client/:clientId')
  async getNotesByClientId(@Param() params: any) {
    return await this.noteService.getNotesByClientId(params.clientId);
  }

  @Post('client/:clientId')
  async createNote(@Param() params: any, @Body() createNoteDto: CreateNoteDto) {
    return await this.noteService.createNote(params.clientId, createNoteDto);
  }

  @Put(':id')
  async updateNote(@Param() params: any, @Body() updateNoteDto: UpdateNoteDto) {
    return await this.noteService.updateNote(params.id, updateNoteDto);
  }

  @Delete(':id')
  async deleteNote(@Param() params: any) {
    return await this.noteService.deleteNote(params.id);
  }
}
