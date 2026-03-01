import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { KnexService } from '../../infra/database/knex.service';
import { CreateUserDto, UserRole } from '../dto/user.dto';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

describe('UserService', () => {
  let service: UserService;
  let knexService: KnexService;

  const mockReturning = jest.fn() as jest.Mock<any>;
  const mockFirst = jest.fn() as jest.Mock<any>;
  const mockUpdate = jest.fn() as jest.Mock<any>;
  const mockWhere = jest.fn().mockReturnValue({ 
    first: mockFirst,
    update: mockUpdate 
  });
  const mockInsert = jest.fn().mockReturnValue({ returning: mockReturning });
  
  const mockWhereIn = jest.fn() as jest.Mock<any>;

  const mockDb = jest.fn().mockReturnValue({
    insert: mockInsert,
    where: mockWhere,
    update: mockUpdate,
    whereIn: mockWhereIn,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: KnexService,
          useValue: {
            db: mockDb,
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    knexService = module.get<KnexService>(KnexService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      role: UserRole.COACH,
      first_name: 'John',
      last_name: 'Doe',
    };

    it('should create a user successfully', async () => {
      const expectedUser = { 
        id: '123', 
        email: 'test@example.com',
        role: UserRole.COACH,
        first_name: 'John',
        last_name: 'Doe'
      };
      
      mockReturning.mockResolvedValue([expectedUser]);

      const result = await service.createUser(createUserDto);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException when user creation fails', async () => {
      mockReturning.mockResolvedValue(null);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDb).toHaveBeenCalledWith('users');
    });

    it('should throw BadRequestException when empty array returned', async () => {
      mockReturning.mockResolvedValue([]);

      await expect(service.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserById', () => {
    const userId = '123';

    it('should return user when found', async () => {
      const expectedUser = { 
        id: userId, 
        email: 'test@example.com',
        role: UserRole.COACH 
      };
      
      mockFirst.mockResolvedValue(expectedUser);

      const result = await service.getUserById(userId);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockFirst.mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ id: userId });
    });

    it('should throw NotFoundException when user is undefined', async () => {
      mockFirst.mockResolvedValue(undefined);

      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSuperusers', () => {
    it('should return users with Admin or Coach role', async () => {
      const superusers = [
        { id: '1', email: 'admin@example.com', role: UserRole.ADMIN },
        { id: '2', email: 'coach@example.com', role: UserRole.COACH },
      ];
      mockWhereIn.mockResolvedValue(superusers);

      const result = await service.getSuperusers();

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhereIn).toHaveBeenCalledWith('role', [UserRole.ADMIN, UserRole.COACH]);
      expect(result).toEqual(superusers);
    });

    it('should return an empty array when no superusers exist', async () => {
      mockWhereIn.mockResolvedValue([]);

      const result = await service.getSuperusers();

      expect(result).toEqual([]);
    });
  });

  describe('updateUser', () => {
    const userId = '123';
    const updatedUser = { 
      id: userId, 
      email: 'updated@example.com',
      first_name: 'Jane'
    };

    beforeEach(() => {
      // Mock getUserById call within updateUser
      mockFirst.mockResolvedValue(updatedUser);
      mockUpdate.mockResolvedValue(1);
    });

    it('should update user successfully with valid fields', async () => {
      const updateData = { 
        first_name: 'Jane', 
        email: 'updated@example.com' 
      };

      const result = await service.updateUser(userId, updateData);

      expect(mockDb).toHaveBeenCalledWith('users');
      expect(mockWhere).toHaveBeenCalledWith({ id: userId });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          email: 'updated@example.com',
          updated_at: expect.any(Date),
        }),
      );
      expect(result).toEqual(updatedUser);
    });

    it('should filter out invalid columns', async () => {
      const updateData = { 
        first_name: 'Jane',
        invalid_column: 'should be filtered',
        another_invalid: 123
      };

      await service.updateUser(userId, updateData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          updated_at: expect.any(Date),
        }),
      );
      expect(mockUpdate).not.toHaveBeenCalledWith(
        expect.objectContaining({
          invalid_column: expect.anything(),
          another_invalid: expect.anything(),
        }),
      );
    });

    it('should throw BadRequestException when no valid fields provided', async () => {
      const updateData = { 
        invalid_column: 'value',
        another_invalid: 'value2'
      };

      await expect(service.updateUser(userId, updateData)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when empty object provided', async () => {
      await expect(service.updateUser(userId, {})).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should include updated_at timestamp', async () => {
      const updateData = { first_name: 'Jane' };

      await service.updateUser(userId, updateData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(Date),
        }),
      );
    });

    it('should handle all allowed columns', async () => {
      const updateData = {
        email: 'new@example.com',
        role: UserRole.ADMIN,
        first_name: 'New',
        last_name: 'Name'
      };

      await service.updateUser(userId, updateData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@example.com',
          role: UserRole.ADMIN,
          first_name: 'New',
          last_name: 'Name',
          updated_at: expect.any(Date),
        }),
      );
    });
  });
})