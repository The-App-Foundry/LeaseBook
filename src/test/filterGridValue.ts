import type { ContextType } from 'react';
import { FilterGridContext } from '../context/FilterGridContext';
import type { Lease, Manager } from '../types/lease';

/**
 * The provider's value shape.
 *
 * `FilterGridContextType` is not exported from `FilterGridContext.tsx`, and
 * production source is off-limits to the test layer, so the type is recovered
 * from the context object itself. This stays exact — if a field is added to
 * the context, {@link BASE_FILTER_GRID_VALUE} stops compiling.
 */
export type FilterGridValue = ContextType<typeof FilterGridContext>;

/**
 * Every field spelled out (no `Partial`, no `as`) so a context that grows a
 * field fails the build here rather than silently defaulting in every test.
 */
const BASE_FILTER_GRID_VALUE: FilterGridValue = {
  leases: [],
  loading: false,
  currentPage: 1,
  pageSize: 50,
  totalCount: 0,
  totalPages: 1,
  setPage: () => {},
  setPageSize: () => {},
  stageCounts: { total: 0, new: 0, contacted: 0, qualified: 0, negotiating: 0, won: 0, lost: 0 },
  activeStage: null,
  setActiveStage: () => {},
  sortOption: 'expiration',
  setSortOption: () => {},
  sortDirection: 'asc',
  setSortDirection: () => {},
  viewMode: 'cards',
  setViewMode: () => {},
  updateLeaseManagers: () => {},
  removeLease: () => {},
  updateLease: () => {},
  refresh: () => {},
};

/** Build a complete context value, overriding only what a test cares about. */
export const createFilterGridValue = (
  overrides: Partial<FilterGridValue> = {},
): FilterGridValue => ({ ...BASE_FILTER_GRID_VALUE, ...overrides });

/** Manager fixture. `isPrimary` defaults to false — flag it explicitly. */
export const createManager = (overrides: Partial<Manager> = {}): Manager => ({
  id: 1,
  name: 'Riley Stone',
  phoneNumbers: ['555-1234'],
  email: 'riley@example.com',
  verified: true,
  isPrimary: false,
  ...overrides,
});

/**
 * Lease fixture.
 *
 * `stage` is `'new'` and `status` `'qualified'` by default: the two are
 * independent in the real model, and tests that care about either must say so.
 */
export const createLease = (overrides: Partial<Lease> = {}): Lease => ({
  id: 1,
  status: 'qualified',
  stage: 'new',
  name: 'Acme Office',
  businessAddr: '1 Main St',
  size: '2500',
  leaseExpiration: '2030-01-01',
  leaseManager: 'Riley Stone',
  managers: [],
  note: undefined,
  ...overrides,
});

/**
 * Calendar-day-offset ISO date, built with LOCAL getters.
 *
 * `daysUntil` derives "today" via `Date.UTC(now.getFullYear(), now.getMonth(),
 * now.getDate())` — local calendar fields fed into a UTC constructor — and the
 * ISO branch of its parser feeds the literal digits into `Date.UTC` the same
 * way. Building fixtures by adding milliseconds to a UTC epoch instead would
 * be off by one outside UTC.
 */
export const isoInDays = (days: number): string => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
};

/** Same calendar day as {@link isoInDays}, in the `MM/DD/YYYY` import shape. */
export const usInDays = (days: number): string => {
  const [year, month, day] = isoInDays(days).split('-');
  return `${month}/${day}/${year}`;
};
