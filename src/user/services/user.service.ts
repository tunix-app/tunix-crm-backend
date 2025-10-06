import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { KnexService } from '../../infra/database/knex.service';
import { CreateUserDto } from '../dto/user.dto';
import { User } from 'src/types/db/user';

const ALLOWED_COLUMNS = [
  'email',
  'role',
  'first_name',
  'last_name',
  'phone',
  'bio',
];

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly knexService: KnexService) {}

  async createUser(createUser: CreateUserDto): Promise<User> {
    const newUser: User[] = await this.knexService
      .db('users')
      .insert(createUser)
      .returning('*');
    if (!newUser || newUser.length === 0) {
      throw new BadRequestException('Failed to create user');
    }
    return newUser[0];
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.knexService.db('users').where({ id }).first();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async updateUser(id: string, updateData: any): Promise<User> {
    this.logger.log(`Inside update user logic`);
    // Filter out keys not in allowed columns
    const filteredData: Record<string, any> = {};
    Object.keys(updateData).forEach((key) => {
      if (ALLOWED_COLUMNS.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      this.logger.error(
        `provided request body does not contain columns from users table`,
      );
      throw new BadRequestException('No valid fields to update');
    }

    // Optionally update the updated_at timestamp
    filteredData.updated_at = new Date();

    await this.knexService.db('users').where({ id }).update(filteredData);
    return this.getUserById(id);
  }
}
