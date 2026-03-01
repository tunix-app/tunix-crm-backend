import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { NoteService } from './services/note.service';
import { CreateNoteDto, Note, UpdateNoteDto } from 'src/types/dto/note.dto';

@ApiTags('Notes')
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @ApiOperation({ summary: 'Get all notes for a client' })
  @ApiParam({ name: 'clientId', description: 'Client UUID' })
  @Get('client/:clientId')
  async getNotesByClientId(@Param() params: any): Promise<Note[]> {
    return await this.noteService.getNotesByClientId(params.clientId);
  }

  @ApiOperation({ summary: 'Create a note for a client' })
  @ApiParam({ name: 'clientId', description: 'Client UUID' })
  @Post('client/:clientId')
  async createNote(
    @Param() params: any,
    @Body() createNoteDto: CreateNoteDto,
  ): Promise<{ message: string }> {
    return await this.noteService.createNote(params.clientId, createNoteDto);
  }

  @ApiOperation({ summary: 'Update a note by ID' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @Patch(':id')
  async updateNote(
    @Param() params: any,
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<{ message: string }> {
    return await this.noteService.updateNote(params.id, updateNoteDto);
  }

  @ApiOperation({ summary: 'Delete a note by ID' })
  @ApiParam({ name: 'id', description: 'Note UUID' })
  @Delete(':id')
  async deleteNote(@Param() params: any): Promise<{ message: string }> {
    return await this.noteService.deleteNote(params.id);
  }
}
