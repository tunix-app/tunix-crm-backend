import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExerciseService } from './services/exercise.service';
import {
  CreateExerciseDto,
  Exercise,
  GetExercisesQueryDto,
  UpdateExerciseDto,
} from '../types/dto/exercise.dto';

@ApiTags('Exercises')
@Controller('exercise')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @ApiOperation({ summary: "Get all exercises in a trainer's catalog" })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter by name (case-insensitive)' })
  @Get('trainer/:trainerId')
  async getExercisesByTrainer(
    @Param('trainerId') trainerId: string,
    @Query() query: GetExercisesQueryDto,
  ): Promise<Exercise[]> {
    return this.exerciseService.getExercisesByTrainer(trainerId, query.search);
  }

  @ApiOperation({ summary: 'Get a single exercise by ID' })
  @ApiParam({ name: 'id', description: 'Exercise UUID' })
  @Get(':id')
  async getExerciseById(@Param('id') id: string): Promise<Exercise> {
    return this.exerciseService.getExerciseById(id);
  }

  @ApiOperation({ summary: "Create a new exercise in a trainer's catalog" })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID' })
  @Post('trainer/:trainerId')
  @HttpCode(HttpStatus.CREATED)
  async createExercise(
    @Param('trainerId') trainerId: string,
    @Body() createExerciseDto: CreateExerciseDto,
  ): Promise<Exercise> {
    return this.exerciseService.createExercise(trainerId, createExerciseDto);
  }

  @ApiOperation({ summary: 'Partially update an exercise by ID' })
  @ApiParam({ name: 'id', description: 'Exercise UUID' })
  @Patch(':id')
  async updateExercise(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    return this.exerciseService.updateExercise(id, updateExerciseDto);
  }

  @ApiOperation({ summary: 'Delete an exercise by ID' })
  @ApiParam({ name: 'id', description: 'Exercise UUID' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteExercise(@Param('id') id: string): Promise<void> {
    await this.exerciseService.deleteExercise(id);
  }
}
