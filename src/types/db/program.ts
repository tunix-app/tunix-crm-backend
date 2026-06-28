export type ProgramStatus = 'DRAFT' | 'READY' | 'IN_PROGRESS' | 'COMPLETE';

export interface ProgramEntity {
  id: string;
  trainer_id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProgramStatus;
  tags: string[];
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProgramExerciseEntity {
  id: string;
  program_id: string;
  exercise_id: string;
  order_index: number;
  sets: number | null;
  reps: string | null;
  duration_seconds: number | null;
  notes: string | null;
}
