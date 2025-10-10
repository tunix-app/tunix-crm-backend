export type ClientEntity = {
  id: string;
  client_id: string;
  trainer_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active: boolean;
  last_session?: Date;
  next_session?: Date;
  current_program?: string;
  goals?: string[];
};
