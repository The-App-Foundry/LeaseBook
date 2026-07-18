import { useRef, memo, useCallback, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Property from './Property';
import { Manager } from '../../types/lease';
import { FilterGridContext } from '../../context';
import { Button } from '../ui';
import './GridContainer.css';

interface GridContainerProps {
  onPropertyClick?: (id: number) => void;
  onPropertyEdit?: (id: number) => void;
  onPropertyDelete?: (id: number) => void;
  onNewProperty?: () => void;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

/** Build a compact page-number list with ellipsis gaps for large ranges. */
const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
};

const GridContainer = ({
  onPropertyClick,
  onPropertyEdit,
  onPropertyDelete,
  onNewProperty,
}: Readonly<GridContainerProps>) => {
  const { 
    leases, 
    currentPage, 
    pageSize, 
    totalCount, 
    totalPages, 
    setPage, 
    setPageSize, 
    updateLeaseManagers 
  } = useContext(FilterGridContext);

  // Stable references updated on every render
  const onChangeRef = useRef(updateLeaseManagers);
  const leasesRef = useRef(leases);
  onChangeRef.current = updateLeaseManagers;
  leasesRef.current = leases;

  // Stable callbacks keyed by lease ID — created once, use refs for current values
  const callbacksMapRef = useRef<Map<number, (managers: Manager[]) => void>>(new Map());

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPageSize(Number(e.target.value));
    },
    [setPageSize],
  );

  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="lb-grid-outer">
      <div className="lb-property-grid">
        {leases.length === 0 && (
          <div className="lb-grid-empty" role="status">
            No properties
          </div>
        )}

        {leases.map(lease => {
          // Get or create a stable callback for this lease ID
          let callback = callbacksMapRef.current.get(lease.id);
          if (!callback) {
            const capturedId = lease.id;
            callback = (managers: Manager[]) => {
              // Use current leases array from ref to find index
              const currentIndex = leasesRef.current.findIndex(l => l.id === capturedId);
              if (currentIndex !== -1) {
                onChangeRef.current?.(currentIndex, managers);
              }
            };
            callbacksMapRef.current.set(lease.id, callback);
          }

          return <Property key={lease.id} data={lease} onManagersChange={callback} onClick={() => onPropertyClick?.(lease.id)} onEdit={() => onPropertyEdit?.(lease.id)} onDelete={() => onPropertyDelete?.(lease.id)} />;
        })}
      </div>

      {/* Pagination bar */}
      {totalCount > 0 && (
        <div className="lb-pagination" id="pagination-bar">
          <div className="lb-pagination-info">
            <span>
              Showing <strong>{rangeStart}–{rangeEnd}</strong> of{' '}
              <strong>{totalCount.toLocaleString()}</strong>
            </span>
          </div>

          <div className="lb-pagination-controls">
            <button
              className="lb-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
              id="pagination-prev"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="lb-page-ellipsis">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  className={`lb-page-btn${page === currentPage ? ' active' : ''}`}
                  onClick={() => setPage(page)}
                  aria-label={`Page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              ),
            )}

            <button
              className="lb-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
              id="pagination-next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="lb-pagination-size">
            <label htmlFor="page-size-select">Rows per page</label>
            <select
              id="page-size-select"
              className="lb-page-size-select"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {onNewProperty && (
        <div className="lb-grid-new-property-wrapper">
          <Button onClick={onNewProperty} className="lb-btn-primary">
            Create New Lease
          </Button>
        </div>
      )}
    </div>
  );
};

export default memo(GridContainer);
