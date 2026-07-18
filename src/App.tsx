import React, { useState, useCallback, useMemo, useContext } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { Header, FilterBar, WorkbookImportFlow, PropertyForm, TabBar, PropertyDetail } from './components/layout';
import type { Tab } from './components/layout/TabBar';
import GridContainer from './components/layout/GridContainer';
import { Button } from './components/ui';
import type { Lease } from './types/lease';
import { FilterGridContext } from './context';
import { getErrorMessage } from './utils/errors';

type Page = 'list' | 'new-property' | 'import' | 'detail';

interface ListPageProps {
  loading: boolean;
  hasLeases: boolean;
  onPropertyClick: (id: number) => void;
  onPropertyEdit: (id: number) => void;
  onPropertyDelete: (id: number) => void;
  onNewProperty: () => void;
  onShowImport: () => void;
}

const ListPageContent = React.memo(function ListPageContent({
  loading,
  hasLeases,
  onPropertyClick,
  onPropertyEdit,
  onPropertyDelete,
  onNewProperty,
  onShowImport,
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
          onPropertyClick={onPropertyClick}
          onPropertyEdit={onPropertyEdit}
          onPropertyDelete={onPropertyDelete}
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
  const { leases, totalCount, loading, activeStage, removeLease, updateLease, refresh } =
    useContext(FilterGridContext);
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [selectedLeaseId, setSelectedLeaseId] = useState<number | null>(null);
  const [startInEditMode, setStartInEditMode] = useState(false);

  const handleImported = useCallback(() => {
    refresh();
    setCurrentPage('list');
  }, [refresh]);

  const handlePropertyCreated = useCallback(() => {
    refresh();
    setCurrentPage('list');
  }, [refresh]);

  const handlePropertyFormCancel = useCallback(() => {
    setCurrentPage('list');
  }, []);

  const hasLeases = useMemo(
    () => leases.length > 0 || totalCount > 0 || activeStage !== null,
    [activeStage, leases.length, totalCount],
  );

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
      removeLease(id);
      
      // If we're on the detail view, go back to list
      if (currentPage === 'detail' && selectedLeaseId === id) {
        setCurrentPage('list');
      }
    } catch (err) {
      console.error('[LeaseBook] Failed to delete lease:', err);
      alert(getErrorMessage(err, 'Failed to delete property. Please try again.'));
    }
  }, [currentPage, selectedLeaseId, removeLease]);

  const handleBackToList = useCallback(() => {
    setCurrentPage('list');
    // We intentionally don't clear selectedLeaseId here so the unmount is smooth
  }, []);

  const handleLeaseSaved = useCallback((updated: Lease) => {
    updateLease(updated);
    
    // If the edit was launched directly from the grid view, go back to the grid.
    if (startInEditMode) {
      setCurrentPage('list');
    }
  }, [startInEditMode, updateLease]);

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
          onPropertyClick={handlePropertyClick}
          onPropertyEdit={handlePropertyEdit}
          onPropertyDelete={handlePropertyDelete}
          onNewProperty={handleNewProperty}
          onShowImport={handleShowImportFlow}
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
