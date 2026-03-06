import { Module } from '@nestjs/common';
import { WaiverController } from './waiver.controller';
import { WaiverService } from './services/waiver.service';

@Module({
  controllers: [WaiverController],
  providers: [WaiverService],
})
export class WaiverModule {}
