import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Upload, Plus, Loader2 } from 'lucide-react';
import { Header, FilterBar, WorkbookImportFlow, PropertyForm } from './components/layout';
import GridContainer from './components/layout/GridContainer';
import { Button } from './components/ui';
import type { Lease, Manager } from './types/lease';

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

const unixToIso = (ts: number): string => new Date(ts * 1000).toISOString().split('T')[0];

const dbLeaseToUi = (db: DbLease, mgrs: DbManager[]): Lease => {
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
    size: db.size ?? 0,
    leaseExpiration: db.expiration_date ? unixToIso(db.expiration_date) : '-',
    leaseManager: managers.map(m => m.name).join(', ') || '-',
    managers,
    note: db.notes ?? undefined,
  };
};

const App = () => {
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

  const renderContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            height: '100%',
          }}
        >
          <Loader2 size={48} className="lb-spin" />
          <p className="lb-pulse" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>
            Loading properties…
          </p>
        </div>
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          height: '100%',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>No leases yet</h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--lb-muted)' }}>
          Import a workbook or create a new lease to get started.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '0.5rem',
          }}
        >
          <Button onClick={() => setShowNewPropertyForm(true)}>
            <Plus size={15} />
            Create New Lease
          </Button>
          <Button onClick={() => setShowImportFlow(true)}>
            <Upload size={15} />
            Import Workbook
          </Button>
        </div>
      </div>
    );
  };

  return (
    <main>
      <Header onNewProperty={() => setShowNewPropertyForm(true)} />
      <div className="lb-app-content">{renderContent()}</div>
      <PropertyForm
        isOpen={showNewPropertyForm}
        onClose={() => setShowNewPropertyForm(false)}
        onCreated={handlePropertyCreated}
      />
    </main>
  );
};

export default App;
