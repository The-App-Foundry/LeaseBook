import './App.css';
import { useState } from 'react';
import styled from 'styled-components';
import { Upload, Plus } from 'lucide-react';
import { Header, FilterBar, WorkbookImportFlow } from './components/layout';
import GridContainer from './components/layout/GridContainer';
import { Button } from './components/ui';
import type { Lease, Manager } from './types/lease';

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

function App() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [showImportFlow, setShowImportFlow] = useState(false);

  const formatManagerNames = (managers: Manager[]): string => {
    return managers.map(m => m.name).join(', ') || '-';
  };

  const handleImported = (imported: Lease[]) => {
    setLeases(imported);
    setShowImportFlow(false);
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
          <Button onClick={() => setShowImportFlow(true)}>
            <Upload size={15} />
            Import Workbook
          </Button>
          <Button $variant="outline">
            <Plus size={15} />
            Create New Lease
          </Button>
        </EmptyActions>
      </EmptyState>
    );
  }

  return (
    <main>
      <Header />
      <Content>{renderContent()}</Content>
    </main>
  );
}

export default App;
