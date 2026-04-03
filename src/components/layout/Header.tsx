import styled from 'styled-components';
import SearchBar from '../ui/SearchBar';
import Button from '../ui/Button';
import { Plus as _Plus } from 'lucide-react';

const Plus = styled(_Plus)`
  height: 16px;
  width: 16px;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
`;

const InnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
`;

const OuterWrapper = styled.div`
  --header-height: var(--app-header-height, 72px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100vw;
  height: var(--header-height);
  padding: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-sizing: border-box;
  z-index: 20;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderLeft = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 200px;
`;

interface HeaderProps {
  onNewProperty?: () => void;
}

const Header = ({ onNewProperty }: Readonly<HeaderProps>) => (
  <OuterWrapper>
    <InnerWrapper>
      <HeaderLeft>
        <div>
          <Logo src="/src/assets/leasebook.webp" alt="LeaseBook logo" />
        </div>
      </HeaderLeft>
      <HeaderRight>
        <SearchBar />
        <Button onClick={onNewProperty}>
          <Plus />
          New Property
        </Button>
      </HeaderRight>
    </InnerWrapper>
  </OuterWrapper>
);

export default Header;
