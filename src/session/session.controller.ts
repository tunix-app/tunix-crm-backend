import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { SessionService } from './services/session.service';
import {
  CreateSessionDto,
  GetSessionRangeDto,
  Session,
  UpdateSessionDto,
} from '../types/dto/session.dto';

@ApiTags('Sessions')
@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @ApiOperation({ summary: 'Get sessions for a trainer within a date range' })
  @ApiParam({ name: 'trainerId', description: 'Trainer UUID' })
  @Post('trainer/:trainerId')
  async getSessionsByTimeRange(
    @Param() params: any,
    @Body() body: GetSessionRangeDto,
  ): Promise<Session[]> {
    const response = await this.sessionService.getSessionsByTimeRange(
      params.trainerId,
      body.start_range,
      body.end_range,
    );

    return response;
  }

  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @Get(':id')
  async getSessionById(@Param() params: any): Promise<Session> {
    return await this.sessionService.getSessionById(params.id);
  }

  @ApiOperation({ summary: 'Create a new session' })
  @Post()
  async createNewSession(
    @Body() createSession: CreateSessionDto,
  ): Promise<Session> {
    return await this.sessionService.createNewSession(createSession);
  }

  @ApiOperation({ summary: 'Update a session by ID' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @Patch(':id')
  async updateSession(
    @Param() params: any,
    @Body() updateData: UpdateSessionDto,
  ): Promise<Session> {
    return await this.sessionService.updateSession(params.id, updateData);
  }

  @ApiOperation({ summary: 'Cancel (delete) a session by ID' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @Delete(':id')
  async cancelSession(@Param() params: any): Promise<{ message: string }> {
    return await this.sessionService.cancelSession(params.id);
  }
}
