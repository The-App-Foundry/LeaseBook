import React, { useEffect, useState, useCallback, useMemo, useContext } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { Header, FilterBar, WorkbookImportFlow, PropertyForm, TabBar, PropertyDetail } from './components/layout';
import type { Tab } from './components/layout/TabBar';
import GridContainer from './components/layout/GridContainer';
import { Button } from './components/ui';
import type { Lease, Manager } from './types/lease';
import { SearchContext } from './context';

interface DbLease {
  id: number;
  name: string;
  address: string;
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

const DEFAULT_PAGE_SIZE = 50;

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
    businessAddr: db.address,
    size: db.size?.toString() ?? '0',
    leaseExpiration: db.expiration_date ? unixToIso(db.expiration_date) : '-',
    leaseManager: managers.map(m => m.name).join(', ') || '-',
    managers,
    note: db.notes ?? undefined,
  };
};



type Page = 'list' | 'new-property' | 'import' | 'detail';

interface ListPageProps {
  loading: boolean;
  hasLeases: boolean;
  leases: Lease[];
  onManagersChange: (leaseIndex: number, managers: Manager[]) => void;
  onPropertyClick: (id: number) => void;
  onPropertyEdit: (id: number) => void;
  onPropertyDelete: (id: number) => void;
  onNewProperty: () => void;
  onShowImport: () => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Module-level memo: React completely skips this subtree when navigating away
const ListPageContent = React.memo(function ListPageContent({
  loading,
  hasLeases,
  leases,
  onManagersChange,
  onPropertyClick,
  onPropertyEdit,
  onPropertyDelete,
  onNewProperty,
  onShowImport,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ListPageProps) {
  if (loading) {
    return (
      <div className="lb-loading-container">
        <Loader2 size={48} className="lb-spin" />
        <p className="lb-pulse lb-loading-text">
          Loading properties…
        </p>
      </div>
    );
  }
  if (hasLeases) {
    return (
      <>
        <FilterBar />
        <GridContainer
          leases={leases}
          onManagersChange={onManagersChange}
          onPropertyClick={onPropertyClick}
          onPropertyEdit={onPropertyEdit}
          onPropertyDelete={onPropertyDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onNewProperty={onNewProperty}
        />
      </>
    );
  }
  return (
    <div className="lb-empty-state-container">
      <h2 className="lb-empty-state-title">No leases yet</h2>
      <p className="lb-empty-state-text">Import a workbook or create a new lease to get started.</p>
      <div className="lb-empty-state-btn-container">
        <Button onClick={onNewProperty}>
          <Plus size={15} />
          Create New Lease
        </Button>
        <Button onClick={onShowImport}>
          <Upload size={15} />
          Import Workbook
        </Button>
      </div>
    </div>
  );
});

const App = () => {
  const { searchQuery } = useContext(SearchContext);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | null>(null);
  const [startInEditMode, setStartInEditMode] = useState(false);

  // Pagination state
  const [dataPage, setDataPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / pageSize)),
    [totalCount, pageSize],
  );

  // Fetch a single page of leases from the backend
  const fetchPage = useCallback(
    (page: number, size: number, query: string) => {
      setLoading(true);
      invoke<PaginatedResponse>('leases_with_managers_paginated', {
        page,
        pageSize: size,
        searchQuery: query || null,
      })
        .then(resp => {
          setLeases(resp.leases.map(r => dbLeaseToUi(r, r.managers)));
          setTotalCount(resp.total_count);
        })
        .catch(err => {
          console.error('[LeaseBook] Failed to load leases:', err);
        })
        .finally(() => setLoading(false));
    },
    [],
  );

  // Load on mount and when page/size/search changes
  useEffect(() => {
    fetchPage(dataPage, pageSize, searchQuery);
  }, [dataPage, pageSize, searchQuery, fetchPage]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setDataPage(1);
  }, [searchQuery]);

  const handlePageChange = useCallback(
    (page: number) => {
      setDataPage(page);
      // Scroll to top of content area on page change
      document.querySelector('.lb-app-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setDataPage(1); // Reset to first page when page size changes
    },
    [],
  );

  const formatManagerNames = useCallback((managers: Manager[]): string => {
    return managers.map(m => m.name).join(', ') || '-';
  }, []);

  const handleImported = useCallback((_imported: Lease[]) => {
    // After import, refresh from page 1 so the user sees the latest data
    setDataPage(1);
    setCurrentPage('list');
  }, []);

  const handlePropertyCreated = useCallback((_lease: Lease) => {
    // After creation, go to last page so the new entry is visible
    setCurrentPage('list');
    // Refetch to update total count, then jump to last page
      invoke<PaginatedResponse>('leases_with_managers_paginated', {
        page: 1,
        pageSize,
        searchQuery: searchQuery || null,
      })
        .then(resp => {
          const newTotal = resp.total_count;
          const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
          setTotalCount(newTotal);
          setDataPage(lastPage);
          fetchPage(lastPage, pageSize, searchQuery); // Force refetch if already on last page
        })
        .catch(err => console.error('[LeaseBook] Failed to refresh after create:', err));
    }, [pageSize, fetchPage, searchQuery]);

  const handlePropertyFormCancel = useCallback(() => {
    setCurrentPage('list');
  }, []);

  const handleManagersChange = useCallback(
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

  const hasLeases = useMemo(() => leases.length > 0 || totalCount > 0, [leases.length, totalCount]);

  const handleNewProperty = useCallback(() => {
    setCurrentPage('new-property');
  }, []);

  const handleShowImportFlow = useCallback(() => {
    setCurrentPage('import');
  }, []);

  const handlePropertyClick = useCallback((id: number) => {
    setSelectedLeaseId(id);
    setStartInEditMode(false);
    setCurrentPage('detail');
  }, []);

  const handlePropertyEdit = useCallback((id: number) => {
    setSelectedLeaseId(id);
    setStartInEditMode(true);
    setCurrentPage('detail');
  }, []);

  const handlePropertyDelete = useCallback(async (id: number) => {
    try {
      await invoke('remove_lease', { leaseId: id });
      // Remove it optimistically from the current page
      setLeases(prev => prev.filter(l => l.id !== id));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      // If we're on the detail view, go back to list
      if (currentPage === 'detail' && selectedLeaseId === id) {
        setCurrentPage('list');
      }
    } catch (err) {
      console.error('[LeaseBook] Failed to delete lease:', err);
      alert('Failed to delete property. Please try again.');
    }
  }, [currentPage, selectedLeaseId]);

  const handleBackToList = useCallback(() => {
    setCurrentPage('list');
    // We intentionally don't clear selectedLeaseId here so the unmount is smooth
  }, []);

  const handleLeaseSaved = useCallback((updated: Lease) => {
    setLeases(prev =>
      prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l)),
    );
    
    // If the edit was launched directly from the grid view, go back to the grid.
    if (startInEditMode) {
      setCurrentPage('list');
    }
  }, [startInEditMode]);

  const isListPage = currentPage === 'list';

  return (
    <main>
      {isListPage && (
        <>
          <Header onNewProperty={handleNewProperty} />
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}

      {/* List page — always mounted; hidden via CSS so no layout recalculation on show */}
      <div className={`lb-app-content${isListPage ? '' : ' lb-page-hidden'}`}>
        <ListPageContent
          loading={loading}
          hasLeases={hasLeases}
          leases={leases}
          onManagersChange={handleManagersChange}
          onPropertyClick={handlePropertyClick}
          onPropertyEdit={handlePropertyEdit}
          onPropertyDelete={handlePropertyDelete}
          onNewProperty={handleNewProperty}
          onShowImport={handleShowImportFlow}
          currentPage={dataPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>

      {/* Form pages — lightweight, safe to conditionally mount */}
      {currentPage === 'new-property' && (
        <div className="lb-app-content-no-header">
          <PropertyForm onClose={handlePropertyFormCancel} onCreated={handlePropertyCreated} />
        </div>
      )}

      {currentPage === 'import' && (
        <div className="lb-app-content-no-header">
          <WorkbookImportFlow
            onImported={handleImported}
            onCancel={() => setCurrentPage('list')}
            autoOpen
          />
        </div>
      )}

      {currentPage === 'detail' && selectedLeaseId !== null && (
        <div className="lb-app-content-no-header">
          <PropertyDetail
            lease={leases.find(l => l.id === selectedLeaseId)!}
            onBack={handleBackToList}
            onSaved={handleLeaseSaved}
            onDelete={() => handlePropertyDelete(selectedLeaseId)}
            initialEditMode={startInEditMode}
          />
        </div>
      )}
    </main>
  );
};

export default App;
