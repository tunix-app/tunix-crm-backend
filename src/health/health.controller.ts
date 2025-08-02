import { Controller, Get } from '@nestjs/common';
import * as pkg from '../../package.json';

@Controller('health')
export class HealthController {
  @Get()
  get() {
    const version = (pkg as any).version || '0.0.0';
    return { status: 'ok', version };
  }
}
