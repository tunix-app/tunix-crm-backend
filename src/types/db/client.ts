export type Client = {
  id: string;
  trainer_id: string; // references users.id
  client_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_session: Date;
  next_session: Date;
  current_progran: string;
  goals: string;
};
