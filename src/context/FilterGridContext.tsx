import React, { createContext, useState, useCallback, useMemo, ReactNode, useContext, useEffect } from 'react';
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  const fetchPage = useCallback((page: number, size: number, query: string, _stage: string | null, _sort: SortOption) => {
    setLoading(true);
    // Currently backend doesn't support stage or sort, but we pass what it supports.
    invoke<PaginatedResponse>('leases_with_managers_paginated', {
      page,
      pageSize: size,
      searchQuery: query || null,
      sortBy: _sort,
    })
      .then(resp => {
        setLeases(resp.leases.map(r => dbLeaseToUi(r.lease, r.managers)));
        setTotalCount(resp.total_count);
      })
      .catch(err => {
        console.error('[LeaseBook] Failed to load leases:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch when dependencies change
  useEffect(() => {
    fetchPage(currentPage, pageSize, searchQuery, activeStage, sortOption);
  }, [currentPage, pageSize, searchQuery, activeStage, sortOption, fetchPage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeStage, sortOption]);

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

  const updateLeaseManagers = useCallback((leaseIndex: number, managers: Manager[]) => {
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
  }, [formatManagerNames]);

  const removeLease = useCallback((id: number) => {
    setLeases(prev => prev.filter(l => l.id !== id));
    setTotalCount(prev => Math.max(0, prev - 1));
  }, []);

  const updateLease = useCallback((updated: Lease) => {
    setLeases(prev => prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l)));
  }, []);

  const refresh = useCallback(() => {
    fetchPage(currentPage, pageSize, searchQuery, activeStage, sortOption);
  }, [currentPage, pageSize, searchQuery, activeStage, sortOption, fetchPage]);

  return (
    <FilterGridContext.Provider
      value={{
        leases,
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
