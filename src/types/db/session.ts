export type SessionEntity = {
  id: string;
  client_id: string;
  trainer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  session_type: SessionType;
  start_time: Date;
  end_time: Date;
  description: string;
  tools_used: ToolMethod[] | null;
};

export enum SessionType {
  STRETCH = 'Stretch',
  TRAINING = 'Personal Training',
  GROUP_TRAINING = 'Group Training',
  NEURO_RECON = 'Neuromuscular Reconstruction',
}

export enum ToolMethod {
  HEATED_SCRAPER = 'Heated scraper',
  SCRAPING_TOOL_KIT = 'Scraping tool kit',
  CUPPING = 'Cupping',
  PNF_STRETCHING = 'PNF stretching',
  TRIGGER_POINT = 'Trigger point/Massage therapy',
  HYPER_VOLT = 'Hyper volt',
  TENS_UNIT = 'Tens unit',
  NORMA_TECH = 'Norma tech',
}
