import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Note {
  id: string;
  client_id: string;
  date: Date;
  content: string;
  tags: string[];
}

// --- INPUT DTOs ---
export class CreateNoteDto {
  @ApiProperty({ example: 'Client showed great improvement in squat depth today.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: ['progress', 'squat'], type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: 'Updated note content.' })
  @IsString()
  @IsOptional()
  content: string;

  @ApiPropertyOptional({ example: ['progress', 'updated'], type: [String] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}
