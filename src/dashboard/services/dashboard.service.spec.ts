import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { KnexService } from '../../infra/database/knex.service';
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from '@jest/globals';

describe('DashboardService', () => {
  let service: DashboardService;

  // Terminal mocks — these are awaited at the end of each query chain
  const mockOrderBy = jest.fn() as jest.Mock<any>;
  const mockFirst = jest.fn() as jest.Mock<any>;

  // Self-referencing query builder: every chainable method returns the builder itself
  const mockBuilder: Record<string, jest.Mock<any>> = {
    join: jest.fn(),
    leftJoin: jest.fn(),
    select: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
    havingRaw: jest.fn(),
    orderBy: mockOrderBy,
    first: mockFirst,
  };

  function wireBuilder() {
    // All non-terminal methods return the builder itself for chaining
    for (const key of Object.keys(mockBuilder)) {
      if (key !== 'orderBy' && key !== 'first') {
        mockBuilder[key].mockReturnValue(mockBuilder);
      }
    }
  }

  wireBuilder();

  const mockRaw = jest.fn().mockReturnValue('raw_sql_expression');

  const mockDb = jest.fn().mockReturnValue(mockBuilder) as jest.Mock<any> & {
    raw: jest.Mock<any>;
  };
  mockDb.raw = mockRaw;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: KnexService,
          useValue: { db: mockDb },
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    wireBuilder();
    mockDb.raw = mockRaw;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    const trainerId = 'trainer-uuid';

    const sessionRow = {
      id: 'session-uuid',
      client_id: 'client-user-uuid',
      client_name: 'Jane Doe',
      session_type: 'TRAINING',
      start_time: new Date('2026-05-09T09:00:00.000Z'),
      end_time: new Date('2026-05-09T10:00:00.000Z'),
      duration_minutes: 60,
      description: null,
    };

    const unscheduledRow = {
      id: 'clients-uuid',
      client_id: 'client-user-uuid-2',
      client_name: 'John Smith',
      client_email: 'john@example.com',
      last_session: new Date('2026-04-20T14:00:00.000Z'),
    };

    function setupMocks(sessions: object[], unscheduled: object[], activeCount = '5') {
      // Promise.all fires all three queries synchronously:
      //   1. getSessionsToday  → awaits orderBy (first call)
      //   2. getActiveClientCount → awaits first
      //   3. getUnscheduledClients → awaits orderBy (second call)
      mockOrderBy
        .mockResolvedValueOnce(sessions)
        .mockResolvedValueOnce(unscheduled);
      mockFirst.mockResolvedValueOnce({ count: activeCount });
    }

    it('happy path — date provided — returns correctly shaped CoachDashboardDto', async () => {
      setupMocks([sessionRow], [unscheduledRow]);

      const result = await service.getDashboard(trainerId, '2026-05-09');

      expect(result.total_sessions_today).toBe(1);
      expect(result.total_active_clients).toBe(5);
      expect(result.sessions_today).toHaveLength(1);
      expect(result.sessions_today[0]).toMatchObject({
        id: 'session-uuid',
        client_id: 'client-user-uuid',
        client_name: 'Jane Doe',
        session_type: 'TRAINING',
        duration_minutes: 60,
        description: null,
      });
      expect(result.unscheduled_clients).toHaveLength(1);
      expect(result.unscheduled_clients[0]).toMatchObject({
        id: 'clients-uuid',
        client_id: 'client-user-uuid-2',
        client_name: 'John Smith',
        client_email: 'john@example.com',
      });
    });

    it('happy path — date omitted — defaults to today; returns CoachDashboardDto', async () => {
      setupMocks([sessionRow], []);

      const result = await service.getDashboard(trainerId);

      expect(result).toHaveProperty('total_sessions_today');
      expect(result).toHaveProperty('total_active_clients');
      expect(result).toHaveProperty('sessions_today');
      expect(result).toHaveProperty('unscheduled_clients');
    });

    it('no sessions today — sessions_today is empty, total_sessions_today is 0', async () => {
      setupMocks([], []);

      const result = await service.getDashboard(trainerId, '2026-05-09');

      expect(result.sessions_today).toEqual([]);
      expect(result.total_sessions_today).toBe(0);
    });

    it('all clients are scheduled — unscheduled_clients is empty', async () => {
      setupMocks([sessionRow], []);

      const result = await service.getDashboard(trainerId, '2026-05-09');

      expect(result.unscheduled_clients).toEqual([]);
    });

    it('client with no sessions at all — last_session is null in unscheduled_clients', async () => {
      const rowWithNullSession = {
        id: 'clients-uuid-3',
        client_id: 'client-user-uuid-3',
        client_name: 'Alice Brown',
        client_email: 'alice@example.com',
        last_session: null,
      };
      setupMocks([], [rowWithNullSession]);

      const result = await service.getDashboard(trainerId, '2026-05-09');

      expect(result.unscheduled_clients[0].last_session).toBeNull();
    });
  });
});
