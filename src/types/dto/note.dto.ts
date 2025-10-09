import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class Note {
  id: string;
  client_id: string;
  date: Date;
  content: string;
  tags: string[];
}

// --- INPUT DTOs ---
export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  tags?: string[];
}

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  tags?: string[];
}
