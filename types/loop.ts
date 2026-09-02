export type LeaseOption = 'none' | '1-hour' | 'tonight' | 'tomorrow' | 'custom';

export type LoopStatus = 'active' | 'waiting' | 'archived';

export type Loop = {
  id: string;
  title: string;
  url: string;
  purpose: string;
  lease: LeaseOption;
  leaseExpiresAt: number | null;
  remindOnReturn: boolean;
  status: LoopStatus;
  createdAt: number;
};