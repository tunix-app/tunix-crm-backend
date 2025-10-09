export type SessionEntity = {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  email: string;
  session_type: SessionType;
  start_time: Date;
  end_time: Date;
  description: string;
};

export enum SessionType {
  STRETCH = 'Stretch',
  TRAINING = 'Personal Training',
  GROUP_TRAINING = 'Group Training',
  NEURO_RECON = 'Neuromuscular Reconstruction'
}