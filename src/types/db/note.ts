export type NoteEntity = {
  id: string;
  client_id: string; // references clients.id
  tags: string[];
  content: string;
  created_at: Date;
  updated_at?: Date;
};
