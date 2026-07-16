import { Search } from 'lucide-react';

export interface SearchBarProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
}: Readonly<SearchBarProps>) => (
  <div className="lb-search-container">
    <Search className="lb-search-icon" aria-hidden="true" />
    <input
      role="searchbox"
      aria-label={placeholder}
      className="lb-search-input"
      value={value ?? ''}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default SearchBar;
