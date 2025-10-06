import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SessionService } from './services/session.service';
import { CreateSessionDto, UpdateSessionDto } from './dto/session.dto';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  async createSession(@Body() sessionData: CreateSessionDto) {
    return this.sessionService.createSession(sessionData);
  }

  @Get('/client/:clientId')
  async getSessionsByClientId(@Param('clientId') clientId: string) {
    return this.sessionService.getSessionsByClientId(clientId);
  }

  @Patch(':id')
  async updateSession(
    @Param('sessionId') sessionId: string,
    @Body() updateData: UpdateSessionDto,
  ) {
    return this.sessionService.updateSession(sessionId, updateData);
  }
}
