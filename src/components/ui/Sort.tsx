import { useState } from 'react';
import { ArrowUpDown, ArrowDownUp } from 'lucide-react';

const Sort = () => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  const tooltipText = `Sort: ${sortOrder === 'asc' ? 'ascending' : 'descending'}`;

  return (
    <button
      className="lb-btn lb-btn-ghost"
      style={{ padding: 0, boxShadow: 'none' }}
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
