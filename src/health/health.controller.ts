import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import * as pkg from '../../package.json';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiOperation({ summary: 'Service health check' })
  @Get()
  get() {
    const version = (pkg as any).version || '0.0.0';
    return { status: 'ok', version };
  }
}
