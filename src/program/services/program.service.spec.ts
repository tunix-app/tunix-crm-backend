import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ProgramService } from './program.service';
import { KnexService } from '../../infra/database/knex.service';
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from '@jest/globals';

describe('ProgramService', () => {
  let service: ProgramService;

  const mockDb = jest.fn() as jest.Mock<any>;
  (mockDb as any).raw = jest.fn((val: string) => val);

  const trainerId = 'trainer-uuid';
  const clientId = 'client-uuid';
  const programId = 'program-uuid';
  const exerciseId = 'exercise-uuid';
  const peId = 'pe-uuid';

  const programRow = {
    id: programId,
    trainer_id: trainerId,
    client_id: clientId,
    name: 'Phase 1',
    description: 'Foundation block',
    status: 'DRAFT',
    tags: ['Strength', 'Lower Body'],
    notes: null,
    created_at: new Date('2026-05-24T10:00:00Z'),
    updated_at: new Date('2026-05-24T10:00:00Z'),
  };

  const exerciseRow = {
    id: exerciseId,
    trainer_id: trainerId,
    name: 'Squat',
    description: null,
    tags: ['legs'],
    exercise_demo: null,
  };

  const peRow = {
    id: peId,
    program_id: programId,
    exercise_id: exerciseId,
    order_index: 0,
    sets: 3,
    reps: '8-10',
    duration_seconds: null,
    notes: null,
  };

  const programWithClientName = {
    ...programRow,
    client_name: 'Jane Doe',
  };

  /**
   * Creates a fully chainable Knex query builder mock.
   * - Every chain method (join, where, select, etc.) returns `this`
   * - `.first()` resolves to `firstResolve`
   * - `.del()` resolves to 1
   * - `.returning()` resolves to `returningResolve`
   * - If `selfResolve` is set, `await builder` resolves to that value
   */
  function makeBuilder({
    firstResolve = undefined as any,
    selfResolve = undefined as any,
    returningResolve = undefined as any,
  } = {}) {
    const b: Record<string, any> = {};
    const self = () => b;

    [
      'join', 'leftJoin', 'select', 'where', 'whereILike', 'whereNot',
      'groupBy', 'orderBy', 'max', 'insert', 'update',
    ].forEach((m) => {
      b[m] = jest.fn(self);
    });

    b.first = jest.fn().mockResolvedValue(firstResolve);
    b.del = jest.fn().mockResolvedValue(1);
    b.returning = jest.fn().mockResolvedValue(returningResolve);

    if (selfResolve !== undefined) {
      b.then = (resolve: any, reject: any) =>
        Promise.resolve(selfResolve).then(resolve, reject);
      b.catch = (onRejected: any) =>
        Promise.resolve(selfResolve).catch(onRejected);
    }

    return b;
  }

  /** Creates the two builders always needed for buildProgramResponse */
  function buildProgramBuilders(exercises: any[] = [], programOverride = programWithClientName) {
    const programBuilder = makeBuilder({ firstResolve: programOverride });
    const exercisesBuilder = makeBuilder({ selfResolve: exercises });
    return [programBuilder, exercisesBuilder] as const;
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramService,
        { provide: KnexService, useValue: { db: mockDb } },
      ],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  // getPrograms
  // ---------------------------------------------------------------------------
  describe('getPrograms', () => {
    it('should return program summaries', async () => {
      const summaryRow = { ...programRow, client_name: 'Jane Doe', exercise_count: 2 };
      const listBuilder = makeBuilder({ selfResolve: [summaryRow] });
      mockDb.mockReturnValueOnce(listBuilder);

      const result = await service.getPrograms(trainerId);

      expect(result).toHaveLength(1);
      expect(result[0].client_name).toBe('Jane Doe');
      expect(result[0].exercise_count).toBe(2);
      expect(result[0].tags).toEqual(['Strength', 'Lower Body']);
    });

    it('should filter by client_id when provided', async () => {
      const listBuilder = makeBuilder({ selfResolve: [] });
      mockDb.mockReturnValueOnce(listBuilder);

      const result = await service.getPrograms(trainerId, clientId);

      expect(result).toHaveLength(0);
      expect(listBuilder.where).toHaveBeenCalledWith('p.client_id', clientId);
    });
  });

  // ---------------------------------------------------------------------------
  // createProgram
  // ---------------------------------------------------------------------------
  describe('createProgram', () => {
    it('should create a program and return the full program response', async () => {
      const clientBuilder = makeBuilder({ firstResolve: { id: clientId, trainer_id: trainerId } });
      const insertBuilder = makeBuilder({ returningResolve: [{ id: programId }] });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders();

      mockDb
        .mockReturnValueOnce(clientBuilder)
        .mockReturnValueOnce(insertBuilder)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      const result = await service.createProgram(trainerId, {
        client_id: clientId,
        name: 'Phase 1',
      });

      expect(result.id).toBe(programId);
      expect(result.exercises).toEqual([]);
      expect(insertBuilder.insert).toHaveBeenCalled();
    });

    it('should pass tags to the insert when provided', async () => {
      const clientBuilder = makeBuilder({ firstResolve: { id: clientId, trainer_id: trainerId } });
      const insertBuilder = makeBuilder({ returningResolve: [{ id: programId }] });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders(
        [],
        { ...programWithClientName, tags: ['Mobility'] },
      );

      mockDb
        .mockReturnValueOnce(clientBuilder)
        .mockReturnValueOnce(insertBuilder)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      await service.createProgram(trainerId, { client_id: clientId, name: 'Phase 1', tags: ['Mobility'] });

      const insertCall = insertBuilder.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertCall.tags).toBe(JSON.stringify(['Mobility']));
    });

    it('should throw ForbiddenException when client does not belong to trainer', async () => {
      const clientBuilder = makeBuilder({ firstResolve: undefined });
      mockDb.mockReturnValueOnce(clientBuilder);

      await expect(
        service.createProgram(trainerId, { client_id: 'other-client', name: 'Phase 1' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------------------------------------------------------------------
  // getProgramById
  // ---------------------------------------------------------------------------
  describe('getProgramById', () => {
    it('should return a program by ID', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders();

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      const result = await service.getProgramById(trainerId, programId);

      expect(result.id).toBe(programId);
    });

    it('should throw NotFoundException when program not found', async () => {
      mockDb.mockReturnValueOnce(makeBuilder({ firstResolve: undefined }));

      await expect(service.getProgramById(trainerId, 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when program belongs to another trainer', async () => {
      mockDb.mockReturnValueOnce(
        makeBuilder({ firstResolve: { ...programRow, trainer_id: 'other-trainer' } }),
      );

      await expect(service.getProgramById(trainerId, programId)).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------------------------------------------------------------------
  // updateProgram
  // ---------------------------------------------------------------------------
  describe('updateProgram', () => {
    it('should update program metadata and return updated program', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const updateBuilder = makeBuilder({ selfResolve: 1 });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders();

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(updateBuilder)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      const result = await service.updateProgram(trainerId, programId, { name: 'Updated' });

      expect(result.id).toBe(programId);
      expect(updateBuilder.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when program is COMPLETE', async () => {
      mockDb.mockReturnValueOnce(
        makeBuilder({ firstResolve: { ...programRow, status: 'COMPLETE' } }),
      );

      await expect(
        service.updateProgram(trainerId, programId, { name: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for invalid status transition DRAFT → COMPLETE', async () => {
      mockDb.mockReturnValueOnce(makeBuilder({ firstResolve: programRow }));

      await expect(
        service.updateProgram(trainerId, programId, { status: 'COMPLETE' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid status transition DRAFT → READY', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const updateBuilder = makeBuilder({ selfResolve: 1 });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders(
        [],
        { ...programWithClientName, status: 'READY' },
      );

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(updateBuilder)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      const result = await service.updateProgram(trainerId, programId, { status: 'READY' });

      expect(result.status).toBe('READY');
    });
  });

  // ---------------------------------------------------------------------------
  // deleteProgram
  // ---------------------------------------------------------------------------
  describe('deleteProgram', () => {
    it('should delete the program', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const delBuilder = makeBuilder();

      mockDb.mockReturnValueOnce(findBuilder).mockReturnValueOnce(delBuilder);

      await service.deleteProgram(trainerId, programId);

      expect(delBuilder.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException when program not found', async () => {
      mockDb.mockReturnValueOnce(makeBuilder({ firstResolve: undefined }));

      await expect(service.deleteProgram(trainerId, 'missing')).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // addExercise
  // ---------------------------------------------------------------------------
  describe('addExercise', () => {
    it('should add an exercise at order_index 0 when program is empty', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const exerciseFindBuilder = makeBuilder({ firstResolve: exerciseRow });
      const maxBuilder = makeBuilder({ firstResolve: { max_index: null } });
      const insertBuilder = makeBuilder({ returningResolve: [peRow] });

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(exerciseFindBuilder)
        .mockReturnValueOnce(maxBuilder)
        .mockReturnValueOnce(insertBuilder);

      const result = await service.addExercise(trainerId, programId, {
        exercise_id: exerciseId,
        sets: 3,
        reps: '8-10',
      });

      expect(result.exercise_id).toBe(exerciseId);
      expect(result.order_index).toBe(0);
    });

    it('should assign order_index MAX+1 when exercises already exist', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const exerciseFindBuilder = makeBuilder({ firstResolve: exerciseRow });
      const maxBuilder = makeBuilder({ firstResolve: { max_index: 2 } });
      const insertBuilder = makeBuilder({ returningResolve: [{ ...peRow, order_index: 3 }] });

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(exerciseFindBuilder)
        .mockReturnValueOnce(maxBuilder)
        .mockReturnValueOnce(insertBuilder);

      const result = await service.addExercise(trainerId, programId, { exercise_id: exerciseId });

      expect(result.order_index).toBe(3);
    });

    it('should throw ForbiddenException when program is COMPLETE', async () => {
      mockDb.mockReturnValueOnce(
        makeBuilder({ firstResolve: { ...programRow, status: 'COMPLETE' } }),
      );

      await expect(
        service.addExercise(trainerId, programId, { exercise_id: exerciseId }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when exercise not found', async () => {
      mockDb
        .mockReturnValueOnce(makeBuilder({ firstResolve: programRow }))
        .mockReturnValueOnce(makeBuilder({ firstResolve: undefined }));

      await expect(
        service.addExercise(trainerId, programId, { exercise_id: 'missing' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when exercise belongs to another trainer', async () => {
      mockDb
        .mockReturnValueOnce(makeBuilder({ firstResolve: programRow }))
        .mockReturnValueOnce(
          makeBuilder({ firstResolve: { ...exerciseRow, trainer_id: 'other-trainer' } }),
        );

      await expect(
        service.addExercise(trainerId, programId, { exercise_id: exerciseId }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------------------------------------------------------------------
  // updateProgramExercise
  // ---------------------------------------------------------------------------
  describe('updateProgramExercise', () => {
    it('should update and return the exercise slot', async () => {
      const findBuilder = makeBuilder({ firstResolve: programRow });
      const slotBuilder = makeBuilder({ firstResolve: peRow });
      const updateBuilder = makeBuilder({ returningResolve: [{ ...peRow, reps: '10-12' }] });
      const exerciseLookupBuilder = makeBuilder({
        firstResolve: { name: 'Squat', exercise_demo: null, tags: ['legs'] },
      });

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(slotBuilder)
        .mockReturnValueOnce(updateBuilder)
        .mockReturnValueOnce(exerciseLookupBuilder);

      const result = await service.updateProgramExercise(
        trainerId, programId, peId, { reps: '10-12' },
      );

      expect(result.reps).toBe('10-12');
      expect(result.exercise_name).toBe('Squat');
    });

    it('should throw ForbiddenException when program is COMPLETE', async () => {
      mockDb.mockReturnValueOnce(
        makeBuilder({ firstResolve: { ...programRow, status: 'COMPLETE' } }),
      );

      await expect(
        service.updateProgramExercise(trainerId, programId, peId, { sets: 4 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when exercise slot not found in program', async () => {
      mockDb
        .mockReturnValueOnce(makeBuilder({ firstResolve: programRow }))
        .mockReturnValueOnce(makeBuilder({ firstResolve: undefined }));

      await expect(
        service.updateProgramExercise(trainerId, programId, 'missing-pe', { sets: 4 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // removeProgramExercise
  // ---------------------------------------------------------------------------
  describe('removeProgramExercise', () => {
    it('should delete the slot and re-index remaining exercises', async () => {
      const remaining = [{ id: 'pe-b' }, { id: 'pe-c' }];

      const findBuilder = makeBuilder({ firstResolve: programRow });
      const slotBuilder = makeBuilder({ firstResolve: peRow });
      const delBuilder = makeBuilder();
      const remainingBuilder = makeBuilder({ selfResolve: remaining });
      const updateB1 = makeBuilder({ selfResolve: 1 });
      const updateB2 = makeBuilder({ selfResolve: 1 });

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(slotBuilder)
        .mockReturnValueOnce(delBuilder)
        .mockReturnValueOnce(remainingBuilder)
        .mockReturnValueOnce(updateB1)
        .mockReturnValueOnce(updateB2);

      await service.removeProgramExercise(trainerId, programId, peId);

      expect(delBuilder.del).toHaveBeenCalled();
      expect(updateB1.update).toHaveBeenCalledWith({ order_index: 0 });
      expect(updateB2.update).toHaveBeenCalledWith({ order_index: 1 });
    });

    it('should throw ForbiddenException when program is COMPLETE', async () => {
      mockDb.mockReturnValueOnce(
        makeBuilder({ firstResolve: { ...programRow, status: 'COMPLETE' } }),
      );

      await expect(
        service.removeProgramExercise(trainerId, programId, peId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when slot not found', async () => {
      mockDb
        .mockReturnValueOnce(makeBuilder({ firstResolve: programRow }))
        .mockReturnValueOnce(makeBuilder({ firstResolve: undefined }));

      await expect(
        service.removeProgramExercise(trainerId, programId, 'missing-pe'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ---------------------------------------------------------------------------
  // reorderExercises
  // ---------------------------------------------------------------------------
  describe('reorderExercises', () => {
    it('should reorder and return the updated program', async () => {
      const existingSlots = [{ id: 'pe-a' }, { id: 'pe-b' }];

      const findBuilder = makeBuilder({ firstResolve: programRow });
      const slotsBuilder = makeBuilder({ selfResolve: existingSlots });
      const updateB1 = makeBuilder({ selfResolve: 1 });
      const updateB2 = makeBuilder({ selfResolve: 1 });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders();

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(slotsBuilder)
        .mockReturnValueOnce(updateB1)
        .mockReturnValueOnce(updateB2)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      const result = await service.reorderExercises(trainerId, programId, {
        exercises: [
          { id: 'pe-a', order_index: 1 },
          { id: 'pe-b', order_index: 0 },
        ],
      });

      expect(result.id).toBe(programId);
    });

    it('should throw BadRequestException when exercise list is incomplete', async () => {
      const existingSlots = [{ id: 'pe-a' }, { id: 'pe-b' }, { id: 'pe-c' }];

      mockDb
        .mockReturnValueOnce(makeBuilder({ firstResolve: programRow }))
        .mockReturnValueOnce(makeBuilder({ selfResolve: existingSlots }));

      await expect(
        service.reorderExercises(trainerId, programId, {
          exercises: [
            { id: 'pe-a', order_index: 0 },
            { id: 'pe-b', order_index: 1 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when program is COMPLETE', async () => {
      mockDb.mockReturnValueOnce(
        makeBuilder({ firstResolve: { ...programRow, status: 'COMPLETE' } }),
      );

      await expect(
        service.reorderExercises(trainerId, programId, { exercises: [] }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------------------------------------------------------------------
  // exportProgram
  // ---------------------------------------------------------------------------
  describe('exportProgram', () => {
    it('should return a PDF buffer for a READY program', async () => {
      const findBuilder = makeBuilder({ firstResolve: { ...programRow, status: 'READY' } });
      const [programBuilder, exercisesBuilder] = buildProgramBuilders(
        [],
        { ...programWithClientName, status: 'READY' },
      );

      mockDb
        .mockReturnValueOnce(findBuilder)
        .mockReturnValueOnce(programBuilder)
        .mockReturnValueOnce(exercisesBuilder);

      const result = await service.exportProgram(trainerId, programId);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw ForbiddenException when program status is not READY', async () => {
      mockDb.mockReturnValueOnce(makeBuilder({ firstResolve: programRow }));

      await expect(service.exportProgram(trainerId, programId)).rejects.toThrow(ForbiddenException);
    });
  });
});
