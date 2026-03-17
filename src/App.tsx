import './App.css';
import { useState } from 'react';
import styled from 'styled-components';
import { Header, FilterBar, WorkbookImportFlow } from './components/layout';
import GridContainer from './components/layout/GridContainer';
import { leases as initialLeases } from './data/leases';
import type { Lease } from './types/lease';

const Content = styled.div`
  height: calc(100vh - var(--app-header-height));
  padding-top: var(--app-header-height);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

function App() {
  const [leases, setLeases] = useState<Lease[]>(initialLeases);

  return (
    <main>
      <>
        <Header />
        <Content>
          <WorkbookImportFlow onImported={setLeases} />
          <FilterBar />
          <GridContainer leases={leases} />
        </Content>
      </>
    </main>
  );
}

export default App;
