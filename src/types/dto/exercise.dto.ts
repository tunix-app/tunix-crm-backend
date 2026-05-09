import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Exercise {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  tags: string[];
  exercise_demo: string | null;
}

export class CreateExerciseDto {
  @ApiProperty({ example: 'Romanian Deadlift' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'Hip-hinge movement targeting the hamstrings and glutes.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['posterior chain', 'strength'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=...' })
  @IsString()
  @IsOptional()
  exercise_demo?: string | null;
}

export class UpdateExerciseDto {
  @ApiPropertyOptional({ example: 'RDL' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Hip-hinge movement targeting the hamstrings and glutes.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['posterior chain', 'strength', 'beginner-friendly'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=...' })
  @IsString()
  @IsOptional()
  exercise_demo?: string | null;
}

export class GetExercisesQueryDto {
  @ApiPropertyOptional({
    example: 'deadlift',
    description: 'Case-insensitive filter on exercise name',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
