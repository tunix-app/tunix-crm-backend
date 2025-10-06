import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { KnexService } from '../../infra/database/knex.service';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';


describe('SessionService', () => {
  let service: SessionService;
  let knexService: KnexService;

  const mockReturning = jest.fn() as jest.Mock<any>;
  const mockFirst = jest.fn() as jest.Mock<any>;
  const mockUpdate = jest.fn() as jest.Mock<any>;
  const mockWhere = jest.fn().mockReturnValue({ 
    first: mockFirst,
    update: mockUpdate 
  });
  const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
  
  const mockDb = jest.fn().mockReturnValue({
    insert: mockInsert,
    where: mockWhere,
    update: mockUpdate,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: KnexService,
          useValue: {
            db: mockDb,
          },
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    knexService = module.get<KnexService>(KnexService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a session successfully', async () => {
      const sessionData = {
        client_id: '123',
        trainer_id: '456',
        session_date: '2025-01-01',
        duration: 60,
      };
      const expectedSession = { id: '789', ...sessionData };

      mockReturning.mockResolvedValue([expectedSession]);

      const result = await service.createSession(sessionData);

      expect(mockDb).toHaveBeenCalledWith('sessions');
      expect(mockInsert).toHaveBeenCalledWith(sessionData);
      expect(result).toEqual([expectedSession]);
    });
  });

  describe('getSessionsByClientId', () => {
    it('should return sessions for a client', async () => {
      const clientId = '123';
      const expectedSessions = [
        { id: '1', client_id: clientId, session_date: '2025-01-01' },
        { id: '2', client_id: clientId, session_date: '2025-01-02' },
      ];

      mockWhere.mockReturnValue(expectedSessions);

      const result = await service.getSessionsByClientId(clientId);

      expect(mockDb).toHaveBeenCalledWith('sessions');
      expect(mockWhere).toHaveBeenCalledWith({ client_id: clientId });
      expect(result).toEqual(expectedSessions);
    });
  });
});