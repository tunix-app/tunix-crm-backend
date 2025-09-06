import { IsEmail, IsOptional, IsString, IsNotEmpty, IsUUID, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @IsUUID()
  @IsNotEmpty()
  trainer_id: string;

  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}

export class UpdateClientDto {

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}