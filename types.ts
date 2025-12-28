
export type CopyStyle = 'warm' | 'professional' | 'broadcast' | 'normal';

export interface CopywriterConfig {
  name: string;
  phone: string;
  lineId: string;
  lineLink: string;
  licenseId: string;
  brokerInfo: string; // 新增經紀人資訊欄位
  featureIcon: string;
}

export interface GeneratedCopy {
  content: string;
  timestamp: number;
}
