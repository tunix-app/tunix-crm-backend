export type Note = {
  id: string;
  client_id: string; // references clients.id
  tags: string;
  created_at: Date;
  updated_at: Date;
};
