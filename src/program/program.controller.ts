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
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ProgramService } from './services/program.service';
import {
  AddExerciseDto,
  CreateProgramDto,
  GetProgramsQueryDto,
  ProgramDto,
  ProgramExerciseDto,
  ProgramSummaryDto,
  ReorderExercisesDto,
  UpdateProgramDto,
  UpdateProgramExerciseDto,
} from 'src/types/dto/program.dto';

@ApiTags('Programs')
@UseGuards(JwtAuthGuard)
@Controller('programs')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  @ApiOperation({ summary: 'Get all programs for the authenticated coach' })
  @Get()
  getPrograms(
    @Query() query: GetProgramsQueryDto,
    @Request() req,
  ): Promise<ProgramSummaryDto[]> {
    return this.programService.getPrograms(req.user.id, query.client_id);
  }

  @ApiOperation({ summary: 'Create a new program' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createProgram(
    @Body() dto: CreateProgramDto,
    @Request() req,
  ): Promise<ProgramDto> {
    return this.programService.createProgram(req.user.id, dto);
  }

  @ApiOperation({ summary: 'Get a program by ID' })
  @Get(':id')
  getProgramById(@Param('id') id: string, @Request() req): Promise<ProgramDto> {
    return this.programService.getProgramById(req.user.id, id);
  }

  @ApiOperation({ summary: 'Update program metadata' })
  @Patch(':id')
  updateProgram(
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
    @Request() req,
  ): Promise<ProgramDto> {
    return this.programService.updateProgram(req.user.id, id, dto);
  }

  @ApiOperation({ summary: 'Delete a program' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteProgram(@Param('id') id: string, @Request() req): Promise<void> {
    return this.programService.deleteProgram(req.user.id, id);
  }

  @ApiOperation({ summary: 'Add an exercise to a program' })
  @Post(':id/exercises')
  @HttpCode(HttpStatus.CREATED)
  addExercise(
    @Param('id') id: string,
    @Body() dto: AddExerciseDto,
    @Request() req,
  ): Promise<ProgramExerciseDto> {
    return this.programService.addExercise(req.user.id, id, dto);
  }

  @ApiOperation({ summary: 'Reorder exercises in a program' })
  @Patch(':id/exercises/reorder')
  reorderExercises(
    @Param('id') id: string,
    @Body() dto: ReorderExercisesDto,
    @Request() req,
  ): Promise<ProgramDto> {
    return this.programService.reorderExercises(req.user.id, id, dto);
  }

  @ApiOperation({ summary: 'Update a program exercise slot' })
  @Patch(':id/exercises/:programExerciseId')
  updateProgramExercise(
    @Param('id') id: string,
    @Param('programExerciseId') peId: string,
    @Body() dto: UpdateProgramExerciseDto,
    @Request() req,
  ): Promise<ProgramExerciseDto> {
    return this.programService.updateProgramExercise(
      req.user.id,
      id,
      peId,
      dto,
    );
  }

  @ApiOperation({ summary: 'Remove an exercise from a program' })
  @Delete(':id/exercises/:programExerciseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProgramExercise(
    @Param('id') id: string,
    @Param('programExerciseId') peId: string,
    @Request() req,
  ): Promise<void> {
    return this.programService.removeProgramExercise(req.user.id, id, peId);
  }

  @ApiOperation({ summary: 'Export a program as PDF' })
  @Get(':id/export')
  async exportProgram(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.programService.exportProgram(req.user.id, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="program-${id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
