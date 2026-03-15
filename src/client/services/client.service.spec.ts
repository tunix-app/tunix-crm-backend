import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClientService } from './client.service';
import { KnexService } from '../../infra/database/knex.service';
import { UpdateClientDto } from '../../types/dto/client.dto';
import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  afterEach,
} from '@jest/globals';

describe('ClientService', () => {
  let service: ClientService;

  // Chain mocks
  const mockFirst = jest.fn() as jest.Mock<any>;
  const mockUpdate = jest.fn() as jest.Mock<any>;
  const mockSelect = jest.fn() as jest.Mock<any>;
  const mockJoin = jest.fn() as jest.Mock<any>;
  const mockWhere = jest.fn() as jest.Mock<any>;

  // Wire the query builder chain
  mockWhere.mockReturnValue({ first: mockFirst, update: mockUpdate });
  mockSelect.mockReturnValue({ where: mockWhere });
  mockJoin.mockReturnValue({ select: mockSelect });

  const mockDb = jest.fn().mockImplementation((table: string) => {
    if (table === 'clients as C') {
      return { join: mockJoin };
    }
    return { where: mockWhere };
  });

  const existingClientRow = {
    id: 'client-uuid',
    client_id: 'user-uuid',
    trainer_id: 'trainer-uuid',
    is_active: true,
    current_program: 'Old Program',
    goals: ['Old goal'],
  };

  const joinedClientRow = {
    id: 'client-uuid',
    client_id: 'user-uuid',
    first_name: 'Sam',
    last_name: 'Torres',
    email: 'sam@example.com',
    is_active: true,
    last_session: null,
    next_session: null,
    current_program: 'New Program',
    goals: ['New goal'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: KnexService,
          useValue: { db: mockDb },
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Re-wire chain after clearAllMocks resets return values
    mockWhere.mockReturnValue({ first: mockFirst, update: mockUpdate });
    mockSelect.mockReturnValue({ where: mockWhere });
    mockJoin.mockReturnValue({ select: mockSelect });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateClient', () => {
    const clientId = 'client-uuid';

    function setupMocks() {
      // First call: db('clients').where().first() → existing row
      // Second call: db('clients as C').join().select().where().first() → joined row
      mockFirst
        .mockResolvedValueOnce(existingClientRow)
        .mockResolvedValueOnce(joinedClientRow);
      mockUpdate.mockResolvedValue(undefined);
    }

    it('should throw NotFoundException when client does not exist', async () => {
      mockFirst.mockResolvedValueOnce(null);

      await expect(
        service.updateClient(clientId, { client_name: 'Sam Torres' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should update users table when client_name is provided', async () => {
      setupMocks();
      const dto: UpdateClientDto = { client_name: 'Sam Torres' };

      await service.updateClient(clientId, dto);

      // clients table should NOT be updated (no clients fields)
      // users table should be updated with split name
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'Sam',
        last_name: 'Torres',
      });
    });

    it('should split multi-word last name correctly', async () => {
      setupMocks();
      const dto: UpdateClientDto = { client_name: 'Mary Jane Watson' };

      await service.updateClient(clientId, dto);

      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'Mary',
        last_name: 'Jane Watson',
      });
    });

    it('should update users table when client_email is provided', async () => {
      setupMocks();
      const dto: UpdateClientDto = { client_email: 'new@example.com' };

      await service.updateClient(clientId, dto);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({ email: 'new@example.com' });
    });

    it('should update users table when client_phone is provided', async () => {
      setupMocks();
      const dto: UpdateClientDto = { client_phone: '5120939876' };

      await service.updateClient(clientId, dto);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({ phone: '5120939876' });
    });

    it('should update clients table when current_program is provided', async () => {
      setupMocks();
      const dto: UpdateClientDto = { current_program: 'Strength v2' };

      await service.updateClient(clientId, dto);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({ current_program: 'Strength v2' });
    });

    it('should update clients table when goals is provided', async () => {
      setupMocks();
      const dto: UpdateClientDto = { goals: ['Run 5k'] };

      await service.updateClient(clientId, dto);

      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalledWith({ goals: ['Run 5k'] });
    });

    it('should update both tables when fields from each are provided', async () => {
      setupMocks();
      const dto: UpdateClientDto = {
        client_name: 'Sam Torres',
        client_email: 'sam@example.com',
        client_phone: '5120939876',
        current_program: 'Strength v2',
        goals: ['Run 5k'],
      };

      await service.updateClient(clientId, dto);

      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledWith({
        current_program: 'Strength v2',
        goals: ['Run 5k'],
      });
      expect(mockUpdate).toHaveBeenCalledWith({
        first_name: 'Sam',
        last_name: 'Torres',
        email: 'sam@example.com',
        phone: '5120939876',
      });
    });

    it('should not call update at all when dto is empty', async () => {
      setupMocks();

      await service.updateClient(clientId, {});

      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should return the refreshed client after update', async () => {
      setupMocks();
      const dto: UpdateClientDto = { current_program: 'New Program' };

      const result = await service.updateClient(clientId, dto);

      expect(result).toEqual({
        id: joinedClientRow.id,
        client_id: joinedClientRow.client_id,
        client_name: 'Sam Torres',
        client_email: 'sam@example.com',
        isActive: true,
        last_session: expect.any(Date),
        next_session: expect.any(Date),
        current_program: 'New Program',
        goals: ['New goal'],
      });
    });

    it('should throw BadRequestException when db throws unexpectedly', async () => {
      mockFirst.mockRejectedValueOnce(new Error('DB connection lost'));

      await expect(
        service.updateClient(clientId, { current_program: 'X' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
