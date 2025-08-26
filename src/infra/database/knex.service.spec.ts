import { KnexService } from './knex.service';
import knex from 'knex';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('knex');

describe('KnexService', () => {
  let service: KnexService;

  beforeEach(() => {
    service = new KnexService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize knex instance', () => {
      (knex as unknown as jest.Mock).mockReturnValue('mockKnexInstance');
      service.onModuleInit();
      expect(knex).toHaveBeenCalledWith({
        client: 'pg',
        connection: {
          connectionString: process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
        },
        pool: { min: 2, max: 10 },
      });
      expect(service.db).toBe('mockKnexInstance');
    });
  });

  describe('onModuleDestroy', () => {
    it('should destroy knex instance if exists', async () => {
      const destroyMock = jest.fn();
      (service as any)._db = { destroy: destroyMock };
      await service.onModuleDestroy();
      expect(destroyMock).toHaveBeenCalled();
    });

    it('should not throw if db is undefined', async () => {
      (service as any)._db = undefined;
      await expect(service.onModuleDestroy()).resolves.not.toThrow();
    });
  });
});

