import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { KnexService } from '../../infra/database/knex.service';
import {
  CreateExerciseDto,
  Exercise,
  UpdateExerciseDto,
} from 'src/types/dto/exercise.dto';
import { ExerciseEntity } from 'src/types/db/exercises';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);

  constructor(private readonly knexService: KnexService) {}

  private toResponse(e: ExerciseEntity): Exercise {
    return {
      id: e.id,
      trainer_id: e.trainer_id,
      name: e.name,
      description: e.description ?? null,
      tags: e.tags ?? [],
      exercise_demo: e.exercise_demo ?? null,
    };
  }

  async getExercisesByTrainer(
    trainerId: string,
    search?: string,
  ): Promise<Exercise[]> {
    this.logger.debug(`Fetching exercises for trainer ${trainerId}`);

    const query = this.knexService
      .db('exercises')
      .where('trainer_id', trainerId)
      .select(
        'id',
        'trainer_id',
        'name',
        'description',
        'tags',
        'exercise_demo',
      );

    if (search) {
      query.whereILike('name', `%${search}%`);
    }

    const rows: ExerciseEntity[] = await query;
    return rows.map((e) => this.toResponse(e));
  }

  async getExerciseById(id: string): Promise<Exercise> {
    this.logger.debug(`Fetching exercise ${id}`);

    const row: ExerciseEntity | undefined = await this.knexService
      .db('exercises')
      .where('id', id)
      .select(
        'id',
        'trainer_id',
        'name',
        'description',
        'tags',
        'exercise_demo',
      )
      .first();

    if (!row) {
      throw new NotFoundException(`Exercise ${id} not found`);
    }

    return this.toResponse(row);
  }

  async createExercise(
    trainerId: string,
    dto: CreateExerciseDto,
  ): Promise<Exercise> {
    this.logger.debug(
      `Creating exercise "${dto.name}" for trainer ${trainerId}`,
    );

    const duplicate = await this.knexService
      .db('exercises')
      .where('trainer_id', trainerId)
      .where('name', dto.name)
      .first();

    if (duplicate) {
      throw new ConflictException(
        'An exercise with this name already exists in your catalog',
      );
    }

    const [row]: ExerciseEntity[] = await this.knexService
      .db('exercises')
      .insert({
        trainer_id: trainerId,
        name: dto.name,
        description: dto.description ?? null,
        tags: JSON.stringify(dto.tags ?? []),
        exercise_demo: dto.exercise_demo ?? null,
      })
      .returning([
        'id',
        'trainer_id',
        'name',
        'description',
        'tags',
        'exercise_demo',
      ]);

    return this.toResponse(row);
  }

  async updateExercise(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    this.logger.debug(`Updating exercise ${id}`);

    const existing: ExerciseEntity | undefined = await this.knexService
      .db('exercises')
      .where('id', id)
      .first();

    if (!existing) {
      throw new NotFoundException(`Exercise ${id} not found`);
    }

    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.knexService
        .db('exercises')
        .where('trainer_id', existing.trainer_id)
        .where('name', dto.name)
        .whereNot('id', id)
        .first();

      if (conflict) {
        throw new ConflictException(
          'An exercise with this name already exists in your catalog',
        );
      }
    }

    const updatePayload: Partial<ExerciseEntity> & { tags?: string } = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;
    if (dto.tags !== undefined)
      updatePayload.tags = JSON.stringify(dto.tags) as any;
    if (dto.exercise_demo !== undefined)
      updatePayload.exercise_demo = dto.exercise_demo;

    const [updated]: ExerciseEntity[] = await this.knexService
      .db('exercises')
      .where('id', id)
      .update({ ...updatePayload, updated_at: new Date() })
      .returning([
        'id',
        'trainer_id',
        'name',
        'description',
        'tags',
        'exercise_demo',
      ]);

    return this.toResponse(updated);
  }

  async deleteExercise(id: string): Promise<void> {
    this.logger.debug(`Deleting exercise ${id}`);

    const existing = await this.knexService
      .db('exercises')
      .where('id', id)
      .first();

    if (!existing) {
      throw new NotFoundException(`Exercise ${id} not found`);
    }

    const programRefs = await this.knexService
      .db('programs')
      .where('exercise_id', id)
      .first();

    if (programRefs) {
      throw new ConflictException(
        'This exercise is used in a program and cannot be deleted',
      );
    }

    await this.knexService.db('exercises').where('id', id).del();
  }
}
