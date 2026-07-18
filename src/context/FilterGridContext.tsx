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
import type { Lease, Manager } from '../types/lease';
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
}

interface DbManager {
  id: number;
  name: string;
  phone_numbers: string | null;
  email: string | null;
}

interface DbLeaseWithManagers extends DbLease {
  managers: DbManager[];
}

interface PaginatedResponse {
  leases: DbLeaseWithManagers[];
  total_count: number;
}

const unixToIso = (ts: number): string => new Date(ts * 1000).toISOString().split('T')[0];

const dbLeaseToUi = (db: DbLease, mgrs: DbManager[]): Lease => {
  const isExpired = db.expiration_date ? db.expiration_date * 1000 < Date.now() : false;
  const managers: Manager[] = mgrs.map(m => ({
    id: m.id,
    name: m.name,
    phoneNumbers: m.phone_numbers ? m.phone_numbers.split(',').map(p => p.trim()) : [],
    email: m.email ?? undefined,
    verified: true,
  }));
  return {
    id: db.id,
    status: isExpired ? 'prospect' : 'qualified',
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

  // Filters & Sort
  activeStage: string | null;
  setActiveStage: (stage: string | null) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;

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
  activeStage: null,
  setActiveStage: () => {},
  sortOption: 'expiration',
  setSortOption: () => {},
  sortDirection: 'asc',
  setSortDirection: () => {},
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

  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('expiration');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );
  const sortedLeases = useMemo(
    () => sortLeases(leases, sortOption, sortDirection),
    [leases, sortOption, sortDirection],
  );

  const fetchPage = useCallback(
    (page: number, size: number, query: string, stage: string | null) => {
      setLoading(true);
      invoke<PaginatedResponse>('leases_with_managers_paginated', {
        page,
        pageSize: size,
        searchQuery: query || null,
        ...(stage ? { stage } : {}),
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
    fetchPage(currentPage, pageSize, searchQuery, activeStage);
  }, [currentPage, pageSize, searchQuery, activeStage, fetchPage]);

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

  const removeLease = useCallback((id: number) => {
    setLeases(prev => prev.filter(l => l.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
  }, []);

  const updateLease = useCallback((updated: Lease) => {
    setLeases(prev => prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l)));
  }, []);

  const refresh = useCallback(() => {
    fetchPage(currentPage, pageSize, searchQuery, activeStage);
  }, [currentPage, pageSize, searchQuery, activeStage, fetchPage]);

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
        activeStage,
        setActiveStage,
        sortOption,
        setSortOption,
        sortDirection,
        setSortDirection,
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
