import { Module } from '@nestjs/common';
import { KnexModule } from 'src/infra/database/knex.module';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './services/exercise.service';

@Module({
  imports: [KnexModule],
  controllers: [ExerciseController],
  providers: [ExerciseService],
})
export class ExerciseModule {}
