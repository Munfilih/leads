export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  WAITING_LIST = 'WAITING LIST',
  LOST = 'LOST',
  WON = 'WON',
  SPAM = 'SPAM'
}

export enum LeadCategory {
  UNCATEGORIZED = 'UNCATEGORIZED',
  HOT = 'HOT',
  WARM = 'WARM',
  COLD = 'COLD',
  FAKE = 'FAKE'
}

export interface Lead {
  id: string;
  uid: string;
  dateTime: string;
  slNo: string;
  phone: string;
  country: string;
  place: string;
  name: string;
  leadQuality: LeadCategory;
  businessIndustry: string;
  specialNotes: string;
  currentStatus: LeadStatus;
  forwardedTo: string;
}

export interface DashboardStats {
  total: number;
  new: number;
  qualified: number;
  conversionRate: number;
}
