import { Injectable, Logger } from '@nestjs/common';
import { KnexService } from 'src/infra/database/knex.service';
import { NoteEntity } from 'src/types/db/note';
import { Note } from 'src/types/dto/note.dto';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(private readonly knexService: KnexService) {}

  async getNotesByClientId(clientId: string) {
    try {
      const notes: NoteEntity[] = await this.knexService
        .db('notes as N')
        .where('N.client_id', clientId)
        .select('*');

      const result: Note[] = notes.map((n) => {
        return {
          id: n.id,
          client_id: n.client_id,
          tags: n.tags,
          content: n.content,
          date: n.updated_at,
        } as Note;
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get notes for client ${clientId}`,
        error.stack,
      );
      throw error;
    }
  }

  async createNote(clientId: string, newNote: any) {
    try {
      const newNoteEntity = {
        client_id: clientId,
        tags: newNote.tags || [],
        content: newNote.content,
        created_at: new Date(),
      };

      await this.knexService.db('notes').insert(newNoteEntity).returning('*');

      return { message: `Note created for client ${clientId}` };
    } catch (error) {
      this.logger.error(
        `Failed to create note for client ${clientId}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateNote(id: string, updateNote: any) {
    try {
      await this.knexService
        .db('notes')
        .where('id', id)
        .update({
          ...updateNote,
          updated_at: new Date(),
        })
        .returning('*');

      return { message: `Note ${id} updated successfully` };
    } catch (error) {
      this.logger.error(`Failed to update note ${id}`, error.stack);
      throw error;
    }
  }

  async deleteNote(id: string) {
    try {
      await this.knexService.db('notes').where('id', id).del();
      return { message: 'Note deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete note ${id}`, error.stack);
      throw error;
    }
  }
}
