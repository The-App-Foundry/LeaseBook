import { useState } from 'react';
import { ArrowUpDown, ArrowDownUp } from 'lucide-react';
import './Sort.css';

type SortDirection = 'asc' | 'desc';

interface SortProps {
  value?: SortDirection;
  onChange?: (direction: SortDirection) => void;
}

const Sort = ({ value, onChange }: SortProps) => {
  const [internalSortOrder, setInternalSortOrder] = useState<SortDirection>('asc');
  const sortOrder = value ?? internalSortOrder;

  const toggleSortOrder = () => {
    const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setInternalSortOrder(nextOrder);
    onChange?.(nextOrder);
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
