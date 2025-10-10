import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  query: string;
}

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  client_name: string;

  @IsString()
  @IsNotEmpty()
  client_email: string;

  @IsString()
  @IsOptional()
  client_phone?: string;

  @IsArray()
  @IsOptional()
  goals?: string[];
}

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  current_program?: string;

  @IsArray()
  @IsOptional()
  goals?: string[];
}
