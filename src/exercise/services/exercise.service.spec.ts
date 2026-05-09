import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { KnexService } from '../../infra/database/knex.service';
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from '@jest/globals';

describe('ExerciseService', () => {
  let service: ExerciseService;

  const mockFirst = jest.fn() as jest.Mock<any>;
  const mockWhere = jest.fn() as jest.Mock<any>;
  const mockWhereNot = jest.fn() as jest.Mock<any>;
  const mockWhereILike = jest.fn() as jest.Mock<any>;
  const mockSelect = jest.fn() as jest.Mock<any>;
  const mockInsert = jest.fn() as jest.Mock<any>;
  const mockUpdate = jest.fn() as jest.Mock<any>;
  const mockReturning = jest.fn() as jest.Mock<any>;
  const mockDel = jest.fn() as jest.Mock<any>;

  const exerciseRow = {
    id: 'exercise-uuid',
    trainer_id: 'trainer-uuid',
    name: 'Romanian Deadlift',
    description: 'Hip-hinge movement',
    tags: ['posterior chain', 'strength'],
    exercise_demo: 'https://youtube.com/watch?v=xyz',
  };

  function wireChain() {
    mockWhereNot.mockReturnValue({ first: mockFirst });
    mockWhere.mockReturnValue({
      first: mockFirst,
      select: mockSelect,
      where: mockWhere,
      whereNot: mockWhereNot,
      whereILike: mockWhereILike,
      update: mockUpdate,
      del: mockDel,
    });
    mockWhereILike.mockReturnValue({ first: mockFirst });
    mockSelect.mockReturnValue({ first: mockFirst, where: mockWhere });
    mockInsert.mockReturnValue({ returning: mockReturning });
    mockUpdate.mockReturnValue({ returning: mockReturning });
  }

  const mockDb = jest.fn().mockImplementation(() => ({
    where: mockWhere,
    select: mockSelect,
    insert: mockInsert,
  }));

  beforeEach(async () => {
    wireChain();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        { provide: KnexService, useValue: { db: mockDb } },
      ],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    wireChain();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExercisesByTrainer', () => {
    it('should return exercises for a trainer', async () => {
      // The query chain ends with .select() which must be thenable for await to resolve
      mockSelect.mockReturnValueOnce(Promise.resolve([exerciseRow]));

      const result = await service.getExercisesByTrainer('trainer-uuid');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Romanian Deadlift');
    });
  });

  describe('getExerciseById', () => {
    it('should return an exercise when found', async () => {
      mockFirst.mockResolvedValueOnce(exerciseRow);

      const result = await service.getExerciseById('exercise-uuid');

      expect(result.id).toBe('exercise-uuid');
      expect(result.name).toBe('Romanian Deadlift');
    });

    it('should throw NotFoundException when exercise does not exist', async () => {
      mockFirst.mockResolvedValueOnce(undefined);

      await expect(service.getExerciseById('missing-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createExercise', () => {
    it('should throw ConflictException when name already exists for trainer', async () => {
      // duplicate check returns a row
      mockFirst.mockResolvedValueOnce(exerciseRow);

      await expect(
        service.createExercise('trainer-uuid', {
          name: 'Romanian Deadlift',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockReturning).not.toHaveBeenCalled();
    });

    it('should create and return the new exercise', async () => {
      // duplicate check returns nothing
      mockFirst.mockResolvedValueOnce(undefined);
      mockReturning.mockResolvedValueOnce([exerciseRow]);

      const result = await service.createExercise('trainer-uuid', {
        name: 'Romanian Deadlift',
        tags: ['posterior chain'],
      });

      expect(result.name).toBe('Romanian Deadlift');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should default tags to [] when not provided', async () => {
      mockFirst.mockResolvedValueOnce(undefined);
      mockReturning.mockResolvedValueOnce([
        { ...exerciseRow, tags: [] },
      ]);

      const result = await service.createExercise('trainer-uuid', {
        name: 'Squat',
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ tags: JSON.stringify([]) }),
      );
      expect(result.tags).toEqual([]);
    });
  });

  describe('updateExercise', () => {
    it('should throw NotFoundException when exercise does not exist', async () => {
      mockFirst.mockResolvedValueOnce(undefined);

      await expect(
        service.updateExercise('missing-uuid', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when new name conflicts with another exercise', async () => {
      // existing exercise
      mockFirst.mockResolvedValueOnce(exerciseRow);
      // conflict check returns a row
      mockFirst.mockResolvedValueOnce({ ...exerciseRow, id: 'other-uuid' });

      await expect(
        service.updateExercise('exercise-uuid', { name: 'Squat' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should update and return the exercise', async () => {
      // existing
      mockFirst.mockResolvedValueOnce(exerciseRow);
      // no name conflict (name unchanged)
      mockReturning.mockResolvedValueOnce([
        { ...exerciseRow, description: 'Updated desc' },
      ]);

      const result = await service.updateExercise('exercise-uuid', {
        description: 'Updated desc',
      });

      expect(result.description).toBe('Updated desc');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should skip conflict check when name is not changing', async () => {
      mockFirst.mockResolvedValueOnce(exerciseRow);
      mockReturning.mockResolvedValueOnce([exerciseRow]);

      await service.updateExercise('exercise-uuid', {
        name: 'Romanian Deadlift',
      });

      // whereNot should not be called since name matches existing
      expect(mockWhereNot).not.toHaveBeenCalled();
    });
  });

  describe('deleteExercise', () => {
    it('should throw NotFoundException when exercise does not exist', async () => {
      mockFirst.mockResolvedValueOnce(undefined);

      await expect(service.deleteExercise('missing-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when exercise is referenced by a program', async () => {
      // exercise exists
      mockFirst.mockResolvedValueOnce(exerciseRow);
      // program reference exists
      mockFirst.mockResolvedValueOnce({ exercise_id: 'exercise-uuid' });

      await expect(service.deleteExercise('exercise-uuid')).rejects.toThrow(
        ConflictException,
      );

      expect(mockDel).not.toHaveBeenCalled();
    });

    it('should delete the exercise when no program references exist', async () => {
      mockFirst.mockResolvedValueOnce(exerciseRow);
      mockFirst.mockResolvedValueOnce(undefined);
      mockDel.mockResolvedValueOnce(1);

      await service.deleteExercise('exercise-uuid');

      expect(mockDel).toHaveBeenCalled();
    });
  });
});
