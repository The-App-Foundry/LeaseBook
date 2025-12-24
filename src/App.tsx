import './App.css';
import styled from 'styled-components';
import { Header, FilterBar } from './components/layout';

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
        </Content>
      </>
    </main>
  );
}

export default App;
