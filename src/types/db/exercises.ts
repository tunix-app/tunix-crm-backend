export type ExerciseEntity = {
  id: string;
  trainer_id: string;
  name: string;
  description: string | null;
  tags: string[];
  exercise_demo: string | null;
  created_at: Date;
  updated_at: Date;
};
