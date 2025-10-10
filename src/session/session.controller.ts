import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SessionService } from './services/session.service';
import {
  CreateSessionDto,
  GetSessionRangeDto,
  Session,
  UpdateSessionDto,
} from '../types/dto/session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

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

  @Get(':id')
  async getSessionById(@Param() params: any): Promise<Session> {
    return await this.sessionService.getSessionById(params.id);
  }

  @Post()
  async createNewSession(
    @Body() createSession: CreateSessionDto,
  ): Promise<Session> {
    return await this.sessionService.createNewSession(createSession);
  }

  @Patch(':id')
  async updateSession(
    @Param() params: any,
    @Body() updateData: UpdateSessionDto,
  ): Promise<Session> {
    return await this.sessionService.updateSession(params.id, updateData);
  }

  @Delete(':id')
  async cancelSession(@Param() params: any): Promise<{ message: string }> {
    return await this.sessionService.cancelSession(params.id);
  }
}
