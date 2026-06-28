import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from './services/program.service';

@Module({
  controllers: [ProgramController],
  providers: [ProgramService],
})
export class ProgramModule {}
