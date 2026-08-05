import type { Stage } from '../utils/stageColors';

/**
 * Re-export so consumers can `import type { Lease, Stage } from '../types/lease'`.
 * `Stage` is DECLARED in `utils/stageColors.ts` — do not redeclare it here.
 */
export type { Stage } from '../utils/stageColors';

export interface Manager {
  id: number;
  name: string;
  phoneNumbers: string[];
  email?: string;
  /** true = auto-detected cleanly from import; false = needs manual curation */
  verified: boolean;
  /**
   * Whether this manager is the primary contact FOR THE LEASE they were loaded
   * under. Lives on the `leases_managers` join row, not on the manager itself —
   * the same person can be primary on one lease and not another.
   */
  isPrimary: boolean;
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
  /**
   * Derived client-side from `leaseExpiration` alone. Retained for existing
   * read-only branching (import heuristics, legacy sorting).
   *
   * DO NOT RENDER IT. Once a user moves a lease to `won`/`lost`, `status` and
   * {@link Lease.stage} disagree. Render `stage` instead.
   */
  status: 'qualified' | 'prospect';
  /** Real, user-owned pipeline stage persisted in the `leases.stage` column. */
  stage: Stage;
  name: string;
  businessAddr?: string;
  size?: string;
  leaseExpiration?: string; // ISO date preferred, or friendly string
  leaseManager?: string;
  managers: Manager[];
  note?: string;
}
