
export type CopyStyle = 'warm' | 'professional' | 'broadcast' | 'normal';

export interface CopywriterConfig {
  name: string;
  phone: string;
  lineId: string;
  lineLink: string;
}

export interface GeneratedCopy {
  content: string;
  timestamp: number;
}
