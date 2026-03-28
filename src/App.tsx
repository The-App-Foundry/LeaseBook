import './App.css';
import { useState } from 'react';
import styled from 'styled-components';
import { Header, FilterBar, WorkbookImportFlow } from './components/layout';
import GridContainer from './components/layout/GridContainer';
import type { Lease, Manager } from './types/lease';

const Content = styled.div`
  height: calc(100vh - var(--app-header-height));
  padding-top: var(--app-header-height);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

function App() {
  const [leases, setLeases] = useState<Lease[]>([]);

  const formatManagerNames = (managers: Manager[]): string => {
    return managers.map(m => m.name).join(', ') || '-';
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

  return (
    <main>
      <Header />
      <Content>
        <WorkbookImportFlow onImported={setLeases} />
        <FilterBar />
        <GridContainer leases={leases} onManagersChange={handleManagersChange} />
      </Content>
    </main>
  );
}

export default App;
