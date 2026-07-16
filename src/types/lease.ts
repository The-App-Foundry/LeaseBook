export interface Manager {
  id: number;
  name: string;
  phoneNumbers: string[];
  email?: string;
  /** true = auto-detected cleanly from import; false = needs manual curation */
  verified: boolean;
}

export interface ManagerEdit {
  id: number;
  name?: string;
  phoneNumbers: string[];
  email?: string;
  verified?: boolean;
}

export interface ManagerCreate {
  name: string;
  phoneNumbers: string[];
  email?: string;
  verified: boolean;
}

export interface Lease {
  id: number;
  status: 'qualified' | 'prospect';
  name: string;
  businessAddr?: string;
  size?: string;
  leaseExpiration?: string; // ISO date preferred, or friendly string
  leaseManager?: string;
  managers: Manager[];
  note?: string;
}
