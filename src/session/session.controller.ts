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
  UpdateSessionDto,
} from '../types/dto/session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('trainer/:trainerId')
  async getSessionsByTimeRange(
    @Param() params: any,
    @Body() body: GetSessionRangeDto,
  ) {
    const response = await this.sessionService.getSessionsByTimeRange(
      params.trainerId,
      body.start_range,
      body.end_range,
    );

    return response;
  }

  @Get(':id')
  async getSessionById(@Param() params: any) {
    return await this.sessionService.getSessionById(params.id);
  }

  @Post()
  async createNewSession(@Body() createSession: CreateSessionDto) {
    return await this.sessionService.createNewSession(createSession);
  }

  @Patch(':id')
  async updateSession(
    @Param() params: any,
    @Body() updateData: UpdateSessionDto,
  ) {
    return await this.sessionService.updateSession(params.id, updateData);
  }

  @Delete(':id')
  async cancelSession(@Param() params: any) {
    return await this.sessionService.cancelSession(params.id);
  }
}
