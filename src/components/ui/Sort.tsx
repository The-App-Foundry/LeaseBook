import { useState } from 'react';
import { ArrowUpDown, ArrowDownUp } from 'lucide-react';
import './Sort.css';

const Sort = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const tooltipText = `Sort: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`;

  return (
    <button
      className="lb-btn lb-btn-ghost lb-sort-button"
      onClick={toggleSortOrder}
      title={tooltipText}
      aria-label={tooltipText}
    >
      {sortOrder === 'asc' ? (
        <ArrowDownUp size={15} aria-hidden="true" />
      ) : (
        <ArrowUpDown size={15} aria-hidden="true" />
      )}
    </button>
  );
};

export default Sort;
