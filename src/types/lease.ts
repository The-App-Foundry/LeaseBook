export interface Manager {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  /** true = auto-detected cleanly from import; false = needs manual curation */
  verified: boolean;
}

export interface Lease {
  status: 'qualified' | 'prospect';
  name: string;
  businessAddr: string;
  leaseExpiration: string; // ISO date preferred, or friendly string
  leaseManager: string;
  managers: Manager[];
  size: string;
  note?: string;
}
