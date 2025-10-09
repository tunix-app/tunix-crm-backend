import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { NoteService } from "./services/note.service";
import { CreateNoteDto, UpdateNoteDto } from "src/types/dto/note.dto";

@Controller('note')
export class NoteController {
    constructor(private readonly noteService: NoteService) {}

    @Get('client/:clientId')
    async getNotesByClientId(@Param('clientId') clientId: string) {
        // return Note[]
    }

    @Post()
    async createNote(@Body() createNoteDto: CreateNoteDto) {
        // return Note
    }

    @Put(':id')
    async updateNote(@Param('id') noteId: string, @Body() updateNoteDto: UpdateNoteDto) {
        // return Note
    }

    @Delete(':id')
    async deleteNote(@Param('id') noteId: string) {
        // return { message: 'Note deleted successfully' }
    }
}