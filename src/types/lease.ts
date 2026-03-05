export interface Lease {
  status: 'qualified' | 'prospect';
  name: string;
  businessAddr: string;
  leaseExpiration: string; // ISO date preferred, or friendly string
  decisionMaker: string;
  size: string;
  note?: string;
}
