export type ClientEntity = {
  id: string;
  client_id: string;
  trainer_id: string;
  is_active: boolean;
  last_session?: Date;
  next_session?: Date;
  current_program?: string;
  goals?: string[];
};

/** Shape returned by queries that JOIN clients → users */
export type ClientWithUser = ClientEntity & {
  first_name?: string;
  last_name?: string;
  email?: string;
};
