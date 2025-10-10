import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
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
  @IsNotEmpty()
  start_range: string;

  @IsNotEmpty()
  end_range: string;
}

export class CreateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @IsUUID()
  @IsNotEmpty()
  trainer_id: string;

  @IsString()
  @IsNotEmpty()
  client_name: string;

  @IsString()
  @IsNotEmpty()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  session_type: SessionType;

  @IsNotEmpty()
  start_time: string;

  @IsNotEmpty()
  end_time: string;

  @IsString()
  description: string;
}

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  session_type?: string;

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsString()
  @IsOptional()
  end_time?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
