import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type ProgramStatus = 'DRAFT' | 'READY' | 'IN_PROGRESS' | 'COMPLETE';

const ProgramStatusEnum = ['DRAFT', 'READY', 'IN_PROGRESS', 'COMPLETE'];

export class ProgramExerciseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  exercise_id: string;

  @ApiProperty()
  exercise_name: string;

  @ApiPropertyOptional({ nullable: true })
  exercise_demo: string | null;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  order_index: number;

  @ApiPropertyOptional({ nullable: true })
  sets: number | null;

  @ApiPropertyOptional({ nullable: true })
  reps: string | null;

  @ApiPropertyOptional({ nullable: true })
  duration_seconds: number | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;
}

export class ProgramSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: ProgramStatusEnum })
  status: ProgramStatus;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  client_id: string;

  @ApiProperty()
  client_name: string;

  @ApiProperty()
  exercise_count: number;

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}

export class ProgramDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: ProgramStatusEnum })
  status: ProgramStatus;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  client_id: string;

  @ApiProperty()
  client_name: string;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: [ProgramExerciseDto] })
  exercises: ProgramExerciseDto[];

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}

export class GetProgramsQueryDto {
  @ApiPropertyOptional({ description: 'Filter programs by client UUID' })
  @IsUUID()
  @IsOptional()
  client_id?: string;
}

export class CreateProgramDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  client_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String], description: 'Program focus tags' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateProgramDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ProgramStatusEnum })
  @IsEnum(ProgramStatusEnum)
  @IsOptional()
  status?: ProgramStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'Replaces the entire tags array' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class AddExerciseDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  exercise_id: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sets?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reps?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  duration_seconds?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateProgramExerciseDto {
  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sets?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reps?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  duration_seconds?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReorderItemDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsInt()
  order_index: number;
}

export class ReorderExercisesDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  exercises: ReorderItemDto[];
}
