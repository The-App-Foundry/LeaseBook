import './App.css';
import styled from 'styled-components';
import { Header, FilterBar } from './components/layout';
import GridContainer from './components/layout/GridContainer';

const Content = styled.div`
  height: calc(100vh - var(--app-header-height));
  padding-top: var(--app-header-height);
  box-sizing: border-box;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
`;

function App() {
  return (
    <main>
      <>
        <Header />
        <Content>
          <FilterBar />
          <GridContainer />
        </Content>
      </>
    </main>
  );
}

export default App;
