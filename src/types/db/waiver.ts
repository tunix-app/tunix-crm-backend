export type WaiverEntity = {
  id: string;
  client_id: string; // references clients.id
  storage_path: string;
  original_filename: string;
  file_size_bytes: number;
  uploaded_at: Date;
};
