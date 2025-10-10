import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  tags?: string[];
}

export class UpdateNoteDto {
  @IsString()
  @IsOptional()
  content: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
