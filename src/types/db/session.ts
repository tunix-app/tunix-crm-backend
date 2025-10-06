export type Session = {
  id: string;
  client_id: string; // references clients.id
  start_time: Date;
  end_time: Date;
  created_at: Date;
  updated_at: Date;
  session_type: string;
};
