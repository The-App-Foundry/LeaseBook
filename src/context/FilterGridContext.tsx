import React, {
  createContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { Lease, Manager, Stage } from '../types/lease';
import { parseStage } from '../utils/stageColors';
import { SearchContext } from './SearchContext';

interface DbLease {
  id: number;
  name: string;
  address: string | null;
  size: number | null;
  expiration_date: number | null;
  notes: string | null;
  misc_data: string | null;
  created_on: number;
  /** Lowercase canonical stage, not null on the Rust side. */
  stage: string;
}

interface DbManager {
  id: number;
  name: string;
  phone_numbers: string | null;
  email: string | null;
  /** SQLite INTEGER on the `leases_managers` join row — 0 or 1, NOT a bool. */
  is_primary: number;
}

interface DbLeaseWithManagers extends DbLease {
  managers: DbManager[];
}

interface PaginatedResponse {
  leases: DbLeaseWithManagers[];
  total_count: number;
}

export interface StageCounts {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  negotiating: number;
  won: number;
  lost: number;
}

const EMPTY_STAGE_COUNTS: StageCounts = {
  total: 0,
  new: 0,
  contacted: 0,
  qualified: 0,
  negotiating: 0,
  won: 0,
  lost: 0,
};

/**
 * Unix epoch SECONDS → `YYYY-MM-DD`.
 *
 * Exported so the card grid and the list view format dates identically.
 */
export const unixToIso = (ts: number): string => new Date(ts * 1000).toISOString().split('T')[0];

const dbLeaseToUi = (db: DbLease, mgrs: DbManager[]): Lease => {
  const isExpired = db.expiration_date ? db.expiration_date * 1000 < Date.now() : false;
  const managers: Manager[] = mgrs.map(m => ({
    id: m.id,
    name: m.name,
    phoneNumbers: m.phone_numbers ? m.phone_numbers.split(',').map(p => p.trim()) : [],
    email: m.email ?? undefined,
    verified: true,
    isPrimary: m.is_primary === 1,
  }));
  return {
    id: db.id,
    status: isExpired ? 'prospect' : 'qualified',
    stage: parseStage(db.stage),
    name: db.name,
    businessAddr: db.address ?? undefined,
    size: db.size?.toString() ?? '0',
    leaseExpiration: db.expiration_date ? unixToIso(db.expiration_date) : '-',
    leaseManager: managers.map(m => m.name).join(', ') || '-',
    managers,
    note: db.notes ?? undefined,
  };
};

export type SortOption = 'expiration' | 'name' | 'size';
export type SortDirection = 'asc' | 'desc';

/** Card grid vs. tabular list. Persisted across sessions. */
export type ViewMode = 'cards' | 'list';

/** `localStorage` key backing {@link ViewMode}. */
export const VIEW_MODE_STORAGE_KEY = 'leasebook.viewMode';

const DEFAULT_VIEW_MODE: ViewMode = 'cards';

const isViewMode = (value: unknown): value is ViewMode => value === 'cards' || value === 'list';

/**
 * `localStorage` access is wrapped because it throws in restricted contexts
 * (private mode, blocked storage, quota exhaustion) rather than returning null.
 * A stale or hand-edited key is validated, never cast.
 */
const readStoredViewMode = (): ViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return isViewMode(stored) ? stored : DEFAULT_VIEW_MODE;
  } catch {
    return DEFAULT_VIEW_MODE;
  }
};

const writeStoredViewMode = (mode: ViewMode): void => {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch {
    // Persistence is best-effort; the in-memory state is still authoritative.
  }
};

const compareOptionalNumbers = (
  left: number | null,
  right: number | null,
  direction: SortDirection,
) => {
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;
  return direction === 'asc' ? left - right : right - left;
};

const getLeaseExpirationTime = (lease: Lease) => {
  if (!lease.leaseExpiration || lease.leaseExpiration === '-') return null;
  const time = new Date(lease.leaseExpiration).getTime();
  return Number.isNaN(time) ? null : time;
};

const sortLeases = (
  leases: Lease[],
  sortOption: SortOption,
  sortDirection: SortDirection,
): Lease[] => {
  return [...leases].sort((left, right) => {
    if (sortOption === 'name') {
      const leftBlank = left.name.trim() === '';
      const rightBlank = right.name.trim() === '';
      if (leftBlank !== rightBlank) return leftBlank ? 1 : -1;

      const result = left.name.localeCompare(right.name, undefined, { sensitivity: 'base' });
      return sortDirection === 'asc' ? result : -result;
    }

    if (sortOption === 'size') {
      const leftSize = left.size ? Number.parseFloat(left.size) : Number.NaN;
      const rightSize = right.size ? Number.parseFloat(right.size) : Number.NaN;
      return compareOptionalNumbers(
        Number.isNaN(leftSize) ? null : leftSize,
        Number.isNaN(rightSize) ? null : rightSize,
        sortDirection,
      );
    }

    return compareOptionalNumbers(
      getLeaseExpirationTime(left),
      getLeaseExpirationTime(right),
      sortDirection,
    );
  });
};

interface FilterGridContextType {
  leases: Lease[];
  loading: boolean;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Per-stage pill counts, decoupled from the active filter/page fetch
  stageCounts: StageCounts;

  // Filters & Sort
  /** Lowercase canonical stage, or null for "All Properties". */
  activeStage: Stage | null;
  setActiveStage: (stage: Stage | null) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;

  // Presentation
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Modifiers
  updateLeaseManagers: (leaseIndex: number, managers: Manager[]) => void;
  removeLease: (id: number) => void;
  updateLease: (updated: Lease) => void;
  refresh: () => void;
}

const DEFAULT_PAGE_SIZE = 50;

export const FilterGridContext = createContext<FilterGridContextType>({
  leases: [],
  loading: false,
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalCount: 0,
  totalPages: 1,
  setPage: () => {},
  setPageSize: () => {},
  stageCounts: EMPTY_STAGE_COUNTS,
  activeStage: null,
  setActiveStage: () => {},
  sortOption: 'expiration',
  setSortOption: () => {},
  sortDirection: 'asc',
  setSortDirection: () => {},
  viewMode: DEFAULT_VIEW_MODE,
  setViewMode: () => {},
  updateLeaseManagers: () => {},
  removeLease: () => {},
  updateLease: () => {},
  refresh: () => {},
});

export const FilterGridProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { searchQuery } = useContext(SearchContext);

  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);
  const [stageCounts, setStageCounts] = useState<StageCounts>(EMPTY_STAGE_COUNTS);

  const [activeStage, setActiveStage] = useState<Stage | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('expiration');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Lazy initialiser so the (throwable) storage read happens once, not on
  // every render.
  const [viewMode, setViewModeState] = useState<ViewMode>(readStoredViewMode);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    writeStoredViewMode(mode);
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );
  const sortedLeases = useMemo(
    () => sortLeases(leases, sortOption, sortDirection),
    [leases, sortOption, sortDirection],
  );

  const fetchPage = useCallback(
    (
      page: number,
      size: number,
      query: string,
      stage: Stage | null,
      sortBy: SortOption,
      direction: SortDirection,
    ) => {
      setLoading(true);
      invoke<PaginatedResponse>('leases_with_managers_paginated', {
        page,
        pageSize: size,
        searchQuery: query || null,
        ...(stage ? { stage } : {}),
        sortBy,
        sortDirection: direction,
      })
        .then(resp => {
          setLeases(resp.leases.map(row => dbLeaseToUi(row, row.managers)));
          setTotalCount(resp.total_count);
        })
        .catch(err => {
          console.error('[LeaseBook] Failed to load leases:', err);
        })
        .finally(() => setLoading(false));
    },
    [],
  );

  // Fetch when dependencies change
  useEffect(() => {
    fetchPage(currentPage, pageSize, searchQuery, activeStage, sortOption, sortDirection);
  }, [currentPage, pageSize, searchQuery, activeStage, sortOption, sortDirection, fetchPage]);

  const fetchStageCounts = useCallback((query: string) => {
    invoke<StageCounts>('lease_stage_counts', { searchQuery: query || null })
      .then(setStageCounts)
      .catch(err => {
        console.error('[LeaseBook] Failed to load stage counts:', err);
      });
  }, []);

  // Pill counts only depend on search — NOT activeStage, so clicking a
  // filter pill never re-triggers this fetch, just the page fetch above.
  useEffect(() => {
    fetchStageCounts(searchQuery);
  }, [searchQuery, fetchStageCounts]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeStage]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    document.querySelector('.lb-app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const formatManagerNames = useCallback((managers: Manager[]): string => {
    return managers.map(m => m.name).join(', ') || '-';
  }, []);

  const updateLeaseManagers = useCallback(
    (leaseIndex: number, managers: Manager[]) => {
      setLeases(prev =>
        prev.map((lease, i) => {
          if (i !== leaseIndex) return lease;
          return {
            ...lease,
            managers,
            leaseManager: formatManagerNames(managers),
          };
        }),
      );
    },
    [formatManagerNames],
  );

  const removeLease = useCallback(
    (id: number) => {
      setLeases(prev => prev.filter(l => l.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      fetchStageCounts(searchQuery);
    },
    [fetchStageCounts, searchQuery],
  );

  const updateLease = useCallback((updated: Lease) => {
    setLeases(prev => prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l)));
  }, []);

  const refresh = useCallback(() => {
    fetchPage(currentPage, pageSize, searchQuery, activeStage, sortOption, sortDirection);
    fetchStageCounts(searchQuery);
  }, [
    currentPage,
    pageSize,
    searchQuery,
    activeStage,
    sortOption,
    sortDirection,
    fetchPage,
    fetchStageCounts,
  ]);

  return (
    <FilterGridContext.Provider
      value={{
        leases: sortedLeases,
        loading,
        currentPage,
        pageSize,
        totalCount,
        totalPages,
        setPage,
        setPageSize: handleSetPageSize,
        stageCounts,
        activeStage,
        setActiveStage,
        sortOption,
        setSortOption,
        sortDirection,
        setSortDirection,
        viewMode,
        setViewMode,
        updateLeaseManagers,
        removeLease,
        updateLease,
        refresh,
      }}
    >
      {children}
    </FilterGridContext.Provider>
  );
};
