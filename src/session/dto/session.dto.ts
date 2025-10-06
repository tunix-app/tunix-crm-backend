import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @IsString()
  @IsNotEmpty()
  session_type: string;

  @IsNotEmpty()
  @IsDate()
  start_time: Date;

  @IsNotEmpty()
  @IsDate()
  end_time: Date;
}

export class UpdateSessionDto {
  @IsNotEmpty()
  @IsString()
  session_type?: string;

  @IsNotEmpty()
  @IsDate()
  start_time?: Date;

  @IsNotEmpty()
  @IsDate()
  end_time?: Date;
}
