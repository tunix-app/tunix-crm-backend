import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionType } from '../db/session';

export class Session {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  session_type: SessionType;
  start_date: Date;
  end_date: Date;
  description: string;
}

// --- INPUT DTOs ---
export class GetSessionRangeDto {
  @ApiProperty({ example: '2025-01-01T00:00:00Z', description: 'Start of date range (ISO 8601)' })
  @IsNotEmpty()
  start_range: string;

  @ApiProperty({ example: '2025-01-31T23:59:59Z', description: 'End of date range (ISO 8601)' })
  @IsNotEmpty()
  end_range: string;
}

export class CreateSessionDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsNotEmpty()
  trainer_id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  client_name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsString()
  @IsNotEmpty()
  client_email: string;

  @ApiProperty({ example: 'strength', description: 'Session type (e.g. strength, cardio, mobility)' })
  @IsString()
  @IsNotEmpty()
  session_type: SessionType;

  @ApiProperty({ example: '2025-06-01T09:00:00Z', description: 'Session start time (ISO 8601)' })
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({ example: '2025-06-01T10:00:00Z', description: 'Session end time (ISO 8601)' })
  @IsNotEmpty()
  end_time: string;

  @ApiProperty({ example: 'Focus on upper body compound lifts' })
  @IsString()
  description: string;
}

export class UpdateSessionDto {
  @ApiPropertyOptional({ example: 'cardio' })
  @IsString()
  @IsOptional()
  session_type?: string;

  @ApiPropertyOptional({ example: '2025-06-01T09:30:00Z' })
  @IsString()
  @IsOptional()
  start_time?: string;

  @ApiPropertyOptional({ example: '2025-06-01T10:30:00Z' })
  @IsString()
  @IsOptional()
  end_time?: string;

  @ApiPropertyOptional({ example: 'Updated: added mobility work' })
  @IsString()
  @IsOptional()
  description?: string;
}
