import SearchBar from '../ui/SearchBar';
import Button from '../ui/Button';
import { Plus, Settings } from 'lucide-react';

interface HeaderProps {
  onNewProperty?: () => void;
}

const Header = ({ onNewProperty }: Readonly<HeaderProps>) => (
  <header className="lb-header">
    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
      <img className="lb-header-logo" src="/src/assets/leasebook.webp" alt="LeaseBook logo" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button onClick={onNewProperty}>
        <span className="d-flex align-items-center gap-1">
          <Plus size={18} />
          New Property
        </span>
      </Button>
      <SearchBar />
      <button className="btn btn-link text-body p-1">
        <Settings size={20} />
      </button>
    </div>
  </header>
);

export default Header;
