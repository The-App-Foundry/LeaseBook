import { memo, useContext, useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { SearchContext } from '../../context';
import logo from '../../assets/leasebook.webp';
import logoMobile from '../../assets/leasebook_mobile.webp';
import './Header.css';

interface HeaderProps {
  onNewProperty?: () => void;
  showLogout?: boolean;
  onLogout?: () => void;
}

const Header = ({ onNewProperty, showLogout = false, onLogout }: Readonly<HeaderProps>) => {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <header className="lb-header">
      <div className="lb-header-brand">
        <picture>
          <source media="(max-width: 768px)" srcSet={logoMobile} />
          <img className="lb-header-logo" src={logo} alt="LeaseBook logo" />
        </picture>
        <div className="lb-header-subtitle">Track and manage property leases and expirations</div>
      </div>
      <div className="lb-header-actions">
        {showLogout && (
          <button type="button" onClick={onLogout} className="lb-header-logout-btn">
            <LogOut size={16} />
            Log out
          </button>
        )}
      </div>
      <div className="lb-header-search-wrapper">
        <div className="lb-header-search-inner">
          <div className="lb-header-search-input-container">
            <input 
              role="searchbox"
              type="text" 
              placeholder="Search company or address..." 
              className="lb-header-search-input"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={onNewProperty} 
            className="lb-header-new-btn"
          >
            <span className="lb-header-new-btn-icon">+</span>
            New Property
          </button>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
