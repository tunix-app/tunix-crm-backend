import { Module } from '@nestjs/common';
import { ConfigModule as NestConfig } from '@nestjs/config';
import { validate } from './validation';

@Module({
  imports: [NestConfig.forRoot({ isGlobal: true, validate })],
})
export class ConfigModule {}
