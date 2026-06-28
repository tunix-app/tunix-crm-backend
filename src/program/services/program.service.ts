import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { KnexService } from '../../infra/database/knex.service';
import {
  ProgramEntity,
  ProgramExerciseEntity,
  ProgramStatus,
} from 'src/types/db/program';
import {
  AddExerciseDto,
  CreateProgramDto,
  ProgramDto,
  ProgramExerciseDto,
  ProgramSummaryDto,
  ReorderExercisesDto,
  UpdateProgramDto,
  UpdateProgramExerciseDto,
} from 'src/types/dto/program.dto';

interface ProgramExerciseRow extends ProgramExerciseEntity {
  exercise_name: string;
  exercise_demo: string | null;
  tags: string[];
}

interface ProgramSummaryRow extends ProgramEntity {
  client_name: string;
  exercise_count: string;
}

const ALLOWED_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
  DRAFT: ['READY'],
  READY: ['IN_PROGRESS', 'DRAFT'],
  IN_PROGRESS: ['COMPLETE', 'DRAFT'],
  COMPLETE: [],
};

@Injectable()
export class ProgramService {
  private readonly logger = new Logger(ProgramService.name);

  constructor(private readonly knexService: KnexService) {}

  private async findProgramOrThrow(
    programId: string,
    trainerId: string,
  ): Promise<ProgramEntity> {
    const program: ProgramEntity | undefined = await this.knexService
      .db('programs')
      .where('id', programId)
      .first();

    if (!program) {
      this.logger.warn(`Program ${programId} not found`);
      throw new NotFoundException(`Program ${programId} not found`);
    }

    if (program.trainer_id !== trainerId) {
      this.logger.warn(
        `Trainer ${trainerId} attempted to access program ${programId} owned by ${program.trainer_id}`,
      );
      throw new ForbiddenException('You do not have access to this program');
    }

    return program;
  }

  private async buildProgramResponse(programId: string): Promise<ProgramDto> {
    const program: (ProgramEntity & { client_name: string }) | undefined =
      await this.knexService
        .db('programs as p')
        .join('clients as c', 'p.client_id', 'c.id')
        .join('users as u', 'c.client_id', 'u.id')
        .select(
          'p.id',
          'p.trainer_id',
          'p.client_id',
          'p.name',
          'p.description',
          'p.status',
          'p.tags',
          'p.notes',
          'p.created_at',
          'p.updated_at',
          this.knexService.db.raw(
            "CONCAT(u.first_name, ' ', u.last_name) as client_name",
          ),
        )
        .where('p.id', programId)
        .first();

    if (!program) {
      throw new NotFoundException(`Program ${programId} not found`);
    }

    const exercises: ProgramExerciseRow[] = await this.knexService
      .db('program_exercises as pe')
      .join('exercises as e', 'pe.exercise_id', 'e.id')
      .select(
        'pe.id',
        'pe.program_id',
        'pe.exercise_id',
        'pe.order_index',
        'pe.sets',
        'pe.reps',
        'pe.duration_seconds',
        'pe.notes',
        'e.name as exercise_name',
        'e.exercise_demo',
        'e.tags',
      )
      .where('pe.program_id', programId)
      .orderBy('pe.order_index', 'asc');

    return {
      id: program.id,
      name: program.name,
      description: program.description,
      status: program.status,
      tags: program.tags ?? [],
      client_id: program.client_id,
      client_name: program.client_name,
      notes: program.notes,
      exercises: exercises.map((pe) => this.toProgramExerciseDto(pe)),
      created_at: program.created_at.toISOString(),
      updated_at: program.updated_at.toISOString(),
    };
  }

  private toProgramExerciseDto(pe: ProgramExerciseRow): ProgramExerciseDto {
    return {
      id: pe.id,
      exercise_id: pe.exercise_id,
      exercise_name: pe.exercise_name,
      exercise_demo: pe.exercise_demo,
      tags: pe.tags ?? [],
      order_index: pe.order_index,
      sets: pe.sets,
      reps: pe.reps,
      duration_seconds: pe.duration_seconds,
      notes: pe.notes,
    };
  }

  async getPrograms(
    trainerId: string,
    clientId?: string,
  ): Promise<ProgramSummaryDto[]> {
    this.logger.debug(`Fetching programs for trainer ${trainerId}`);

    const query = this.knexService
      .db('programs as p')
      .join('clients as c', 'p.client_id', 'c.id')
      .join('users as u', 'c.client_id', 'u.id')
      .leftJoin('program_exercises as pe', 'pe.program_id', 'p.id')
      .select(
        'p.id',
        'p.name',
        'p.description',
        'p.status',
        'p.tags',
        'p.client_id',
        'p.created_at',
        'p.updated_at',
        this.knexService.db.raw(
          "CONCAT(u.first_name, ' ', u.last_name) as client_name",
        ),
        this.knexService.db.raw('COUNT(pe.id)::integer as exercise_count'),
      )
      .where('p.trainer_id', trainerId)
      .groupBy('p.id', 'p.tags', 'u.first_name', 'u.last_name')
      .orderBy('p.created_at', 'desc');

    if (clientId) {
      query.where('p.client_id', clientId);
    }

    const rows: ProgramSummaryRow[] = await query;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      tags: r.tags ?? [],
      client_id: r.client_id,
      client_name: r.client_name,
      exercise_count: Number(r.exercise_count),
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
  }

  async createProgram(
    trainerId: string,
    dto: CreateProgramDto,
  ): Promise<ProgramDto> {
    this.logger.debug(
      `Creating program "${dto.name}" for trainer ${trainerId}`,
    );

    const client = await this.knexService
      .db('clients')
      .where('id', dto.client_id)
      .where('trainer_id', trainerId)
      .first();

    if (!client) {
      this.logger.warn(
        `Client ${dto.client_id} not found or does not belong to trainer ${trainerId}`,
      );
      throw new ForbiddenException('Client does not belong to you');
    }

    const [{ id }] = await this.knexService
      .db('programs')
      .insert({
        trainer_id: trainerId,
        client_id: dto.client_id,
        name: dto.name,
        description: dto.description ?? null,
        status: 'DRAFT',
        tags: JSON.stringify(dto.tags ?? []),
      })
      .returning('id');

    return this.buildProgramResponse(id);
  }

  async getProgramById(
    trainerId: string,
    programId: string,
  ): Promise<ProgramDto> {
    this.logger.debug(`Fetching program ${programId} for trainer ${trainerId}`);
    await this.findProgramOrThrow(programId, trainerId);
    return this.buildProgramResponse(programId);
  }

  async updateProgram(
    trainerId: string,
    programId: string,
    dto: UpdateProgramDto,
  ): Promise<ProgramDto> {
    this.logger.debug(`Updating program ${programId}`);

    const program = await this.findProgramOrThrow(programId, trainerId);

    if (program.status === 'COMPLETE') {
      throw new ForbiddenException('COMPLETE programs are immutable');
    }

    if (dto.status !== undefined) {
      const allowed = ALLOWED_TRANSITIONS[program.status];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(
          `Invalid status transition: ${program.status} → ${dto.status}`,
        );
      }
    }

    const updatePayload: Partial<ProgramEntity> = { updated_at: new Date() };
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.tags !== undefined) updatePayload.tags = dto.tags;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;

    await this.knexService
      .db('programs')
      .where('id', programId)
      .update(updatePayload);

    return this.buildProgramResponse(programId);
  }

  async deleteProgram(trainerId: string, programId: string): Promise<void> {
    this.logger.debug(`Deleting program ${programId}`);
    await this.findProgramOrThrow(programId, trainerId);
    await this.knexService.db('programs').where('id', programId).del();
  }

  async addExercise(
    trainerId: string,
    programId: string,
    dto: AddExerciseDto,
  ): Promise<ProgramExerciseDto> {
    this.logger.debug(
      `Adding exercise ${dto.exercise_id} to program ${programId}`,
    );

    const program = await this.findProgramOrThrow(programId, trainerId);

    if (program.status === 'COMPLETE') {
      throw new ForbiddenException('COMPLETE programs are immutable');
    }

    const exercise = await this.knexService
      .db('exercises')
      .where('id', dto.exercise_id)
      .first();

    if (!exercise) {
      throw new NotFoundException(`Exercise ${dto.exercise_id} not found`);
    }

    if (exercise.trainer_id !== trainerId) {
      throw new ForbiddenException('Exercise does not belong to you');
    }

    const maxRow = await this.knexService
      .db('program_exercises')
      .where('program_id', programId)
      .max('order_index as max_index')
      .first();

    const nextIndex =
      maxRow?.max_index != null ? Number(maxRow.max_index) + 1 : 0;

    const [inserted]: ProgramExerciseEntity[] = await this.knexService
      .db('program_exercises')
      .insert({
        program_id: programId,
        exercise_id: dto.exercise_id,
        order_index: nextIndex,
        sets: dto.sets ?? null,
        reps: dto.reps ?? null,
        duration_seconds: dto.duration_seconds ?? null,
        notes: dto.notes ?? null,
      })
      .returning('*');

    return {
      id: inserted.id,
      exercise_id: inserted.exercise_id,
      exercise_name: exercise.name,
      exercise_demo: exercise.exercise_demo ?? null,
      tags: exercise.tags ?? [],
      order_index: inserted.order_index,
      sets: inserted.sets,
      reps: inserted.reps,
      duration_seconds: inserted.duration_seconds,
      notes: inserted.notes,
    };
  }

  async updateProgramExercise(
    trainerId: string,
    programId: string,
    programExerciseId: string,
    dto: UpdateProgramExerciseDto,
  ): Promise<ProgramExerciseDto> {
    this.logger.debug(
      `Updating program_exercise ${programExerciseId} in program ${programId}`,
    );

    const program = await this.findProgramOrThrow(programId, trainerId);

    if (program.status === 'COMPLETE') {
      throw new ForbiddenException('COMPLETE programs are immutable');
    }

    const slot: ProgramExerciseEntity | undefined = await this.knexService
      .db('program_exercises')
      .where('id', programExerciseId)
      .where('program_id', programId)
      .first();

    if (!slot) {
      throw new NotFoundException(
        `Exercise slot ${programExerciseId} not found in program ${programId}`,
      );
    }

    const updatePayload: Partial<ProgramExerciseEntity> = {};
    if (dto.sets !== undefined) updatePayload.sets = dto.sets;
    if (dto.reps !== undefined) updatePayload.reps = dto.reps;
    if (dto.duration_seconds !== undefined)
      updatePayload.duration_seconds = dto.duration_seconds;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes;

    const [updated]: ProgramExerciseEntity[] = await this.knexService
      .db('program_exercises')
      .where('id', programExerciseId)
      .update(updatePayload)
      .returning('*');

    const exercise = await this.knexService
      .db('exercises')
      .where('id', updated.exercise_id)
      .select('name', 'exercise_demo', 'tags')
      .first();

    return {
      id: updated.id,
      exercise_id: updated.exercise_id,
      exercise_name: exercise.name,
      exercise_demo: exercise.exercise_demo ?? null,
      tags: exercise.tags ?? [],
      order_index: updated.order_index,
      sets: updated.sets,
      reps: updated.reps,
      duration_seconds: updated.duration_seconds,
      notes: updated.notes,
    };
  }

  async removeProgramExercise(
    trainerId: string,
    programId: string,
    programExerciseId: string,
  ): Promise<void> {
    this.logger.debug(
      `Removing program_exercise ${programExerciseId} from program ${programId}`,
    );

    const program = await this.findProgramOrThrow(programId, trainerId);

    if (program.status === 'COMPLETE') {
      throw new ForbiddenException('COMPLETE programs are immutable');
    }

    const slot: ProgramExerciseEntity | undefined = await this.knexService
      .db('program_exercises')
      .where('id', programExerciseId)
      .where('program_id', programId)
      .first();

    if (!slot) {
      throw new NotFoundException(
        `Exercise slot ${programExerciseId} not found in program ${programId}`,
      );
    }

    await this.knexService
      .db('program_exercises')
      .where('id', programExerciseId)
      .del();

    const remaining: ProgramExerciseEntity[] = await this.knexService
      .db('program_exercises')
      .where('program_id', programId)
      .orderBy('order_index', 'asc')
      .select('id');

    await Promise.all(
      remaining.map((pe, index) =>
        this.knexService
          .db('program_exercises')
          .where('id', pe.id)
          .update({ order_index: index }),
      ),
    );
  }

  async reorderExercises(
    trainerId: string,
    programId: string,
    dto: ReorderExercisesDto,
  ): Promise<ProgramDto> {
    this.logger.debug(`Reordering exercises in program ${programId}`);

    const program = await this.findProgramOrThrow(programId, trainerId);

    if (program.status === 'COMPLETE') {
      throw new ForbiddenException('COMPLETE programs are immutable');
    }

    const existingSlots: { id: string }[] = await this.knexService
      .db('program_exercises')
      .where('program_id', programId)
      .select('id');

    const existingIds = new Set(existingSlots.map((s) => s.id));
    const providedIds = new Set(dto.exercises.map((e) => e.id));

    for (const id of existingIds) {
      if (!providedIds.has(id)) {
        throw new BadRequestException(
          'Reorder payload is missing existing exercise IDs',
        );
      }
    }

    await Promise.all(
      dto.exercises.map((e) =>
        this.knexService
          .db('program_exercises')
          .where('id', e.id)
          .where('program_id', programId)
          .update({ order_index: e.order_index }),
      ),
    );

    return this.buildProgramResponse(programId);
  }

  async exportProgram(trainerId: string, programId: string): Promise<Buffer> {
    this.logger.debug(`Exporting program ${programId} as PDF`);

    const program = await this.findProgramOrThrow(programId, trainerId);

    if (program.status !== 'READY') {
      throw new ForbiddenException('Only READY programs can be exported');
    }

    const full = await this.buildProgramResponse(programId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(full.name, { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Client: ${full.client_name}`);
      doc.text(`Status: ${full.status}`);
      if (full.tags.length > 0) {
        doc.text(`Tags: ${full.tags.join(', ')}`);
      }
      if (full.description) {
        doc.moveDown(0.5);
        doc.text(`Description: ${full.description}`);
      }
      if (full.notes) {
        doc.moveDown(0.5);
        doc.text(`Notes: ${full.notes}`);
      }

      if (full.exercises.length > 0) {
        doc.moveDown(1);
        doc.fontSize(16).text('Exercises', { underline: true });
        doc.moveDown(0.5);

        full.exercises.forEach((ex, i) => {
          doc.fontSize(13).text(`${i + 1}. ${ex.exercise_name}`);
          const details: string[] = [];
          if (ex.sets != null) details.push(`Sets: ${ex.sets}`);
          if (ex.reps) details.push(`Reps: ${ex.reps}`);
          if (ex.duration_seconds != null)
            details.push(`Duration: ${ex.duration_seconds}s`);
          if (details.length > 0) {
            doc.fontSize(11).text(`   ${details.join(' | ')}`);
          }
          if (ex.notes) {
            doc.fontSize(11).text(`   Notes: ${ex.notes}`);
          }
          doc.moveDown(0.3);
        });
      }

      doc.end();
    });
  }
}
