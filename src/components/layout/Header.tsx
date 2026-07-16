import { memo } from 'react';
import logo from '../../assets/leasebook.webp';
import logoMobile from '../../assets/leasebook_mobile.webp';
import './Header.css';

interface HeaderProps {
  onNewProperty?: () => void;
}

const Header = ({ onNewProperty }: Readonly<HeaderProps>) => (
  <header className="lb-header">
    <div>
      <picture>
        <source media="(max-width: 768px)" srcSet={logoMobile} />
        <img className="lb-header-logo" src={logo} alt="LeaseBook logo" />
      </picture>
      <div className="lb-header-subtitle">Track and manage property leases and expirations</div>
    </div>
    <div className="lb-header-search-wrapper">
      <div className="lb-header-search-inner">
        <input 
          type="text" 
          placeholder="Search company or address..." 
          className="lb-header-search-input"
        />
        <button 
          onClick={onNewProperty} 
          className="lb-header-new-btn"
        >
          <span className="lb-header-new-btn-icon">+</span>
          New Property
        </button>
      </div>
    </div>
    <div className="lb-header-spacer"></div>
  </header>
);

export default memo(Header);
