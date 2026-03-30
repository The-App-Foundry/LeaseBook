import './App.css';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { invoke } from '@tauri-apps/api/core';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { Header, FilterBar, WorkbookImportFlow, NewPropertyForm } from './components/layout';
import GridContainer from './components/layout/GridContainer';
import { Button } from './components/ui';
import type { Lease, Manager } from './types/lease';

interface DbLease {
  id: number;
  name: string;
  address: string;
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

function unixToIso(ts: number): string {
  return new Date(ts * 1000).toISOString().split('T')[0];
}

function dbLeaseToUi(db: DbLease, mgrs: DbManager[]): Lease {
  const isExpired = db.expiration_date ? db.expiration_date * 1000 < Date.now() : false;
  const managers: Manager[] = mgrs.map(m => ({
    id: String(m.id),
    name: m.name,
    phone: m.phone_numbers ?? undefined,
    email: m.email ?? undefined,
    verified: true,
  }));
  return {
    status: isExpired ? 'prospect' : 'qualified',
    name: db.name,
    businessAddr: db.address,
    leaseExpiration: db.expiration_date ? unixToIso(db.expiration_date) : '-',
    leaseManager: managers.map(m => m.name).join(', ') || '-',
    managers,
    size: db.misc_data ?? '-',
    note: db.notes ?? undefined,
  };
}

const Content = styled.div`
  height: calc(100vh - var(--app-header-height));
  padding-top: var(--app-header-height);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  padding: 2rem;
  text-align: center;
`;

const EmptyTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
`;

const EmptySubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const EmptyActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 0.5rem;
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  height: 100%;
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
  color: ${({ theme }) => theme.colors.primary};
`;

const LoadingLabel = styled.p`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

function App() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportFlow, setShowImportFlow] = useState(false);
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false);

  // Load persisted leases from the database on mount
  useEffect(() => {
    interface DbLeaseWithManagers extends DbLease {
      managers: DbManager[];
    }
    invoke<DbLeaseWithManagers[]>('leases_with_managers')
      .then(rows => {
        setLeases(rows.map(r => dbLeaseToUi(r, r.managers)));
      })
      .catch(err => {
        console.error('[LeaseBook] Failed to load leases:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatManagerNames = (managers: Manager[]): string => {
    return managers.map(m => m.name).join(', ') || '-';
  };

  const handleImported = (imported: Lease[]) => {
    setLeases(imported);
    setShowImportFlow(false);
  };

  const handlePropertyCreated = (lease: Lease) => {
    setLeases(prev => [...prev, lease]);
  };

  const handleManagersChange = (leaseIndex: number, managers: Manager[]) => {
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
  };

  const hasLeases = leases.length > 0;

  function renderContent() {
    if (loading) {
      return (
        <LoadingState>
          <Spinner size={48} />
          <LoadingLabel>Loading properties…</LoadingLabel>
        </LoadingState>
      );
    }
    if (hasLeases) {
      return (
        <>
          <FilterBar />
          <GridContainer leases={leases} onManagersChange={handleManagersChange} />
        </>
      );
    }
    if (showImportFlow) {
      return (
        <WorkbookImportFlow
          onImported={handleImported}
          onCancel={() => setShowImportFlow(false)}
          autoOpen
        />
      );
    }
    return (
      <EmptyState>
        <EmptyTitle>No leases yet</EmptyTitle>
        <EmptySubtitle>Import a workbook or create a new lease to get started.</EmptySubtitle>
        <EmptyActions>
          <Button onClick={() => setShowNewPropertyForm(true)}>
            <Plus size={15} />
            Create New Lease
          </Button>
          <Button onClick={() => setShowImportFlow(true)}>
            <Upload size={15} />
            Import Workbook
          </Button>
        </EmptyActions>
      </EmptyState>
    );
  }

  return (
    <main>
      <Header onNewProperty={() => setShowNewPropertyForm(true)} />
      <Content>{renderContent()}</Content>
      <NewPropertyForm
        isOpen={showNewPropertyForm}
        onClose={() => setShowNewPropertyForm(false)}
        onCreated={handlePropertyCreated}
      />
    </main>
  );
}

export default App;
