import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Client {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  isActive: boolean;
  last_session: Date;
  next_session: Date;
  current_program?: string;
  goals?: string[];
}

// --- INPUT DTOs ---
export class SearchClientDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  query: string;
}

export class CreateClientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  client_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  client_email: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsString()
  @IsOptional()
  client_phone?: string;

  @ApiPropertyOptional({ example: ['Lose weight', 'Build strength'], type: [String] })
  @IsArray()
  @IsOptional()
  goals?: string[];
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Strength Program v2' })
  @IsString()
  @IsOptional()
  current_program?: string;

  @ApiPropertyOptional({ example: ['Run 5k', 'Improve mobility'], type: [String] })
  @IsArray()
  @IsOptional()
  goals?: string[];
}
