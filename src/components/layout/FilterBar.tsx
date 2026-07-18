import { memo, useContext } from 'react';
import { FilterGridContext } from '../../context';
import type { SortOption } from '../../context/FilterGridContext';
import { Sort } from '../ui';
import './FilterBar.css';

const STAGE_COLORS: Record<string, { bg: string; abbr: string }> = {
  New: { bg: '#94A3B8', abbr: 'NW' },
  Contacted: { bg: '#3B82F6', abbr: 'CN' },
  Qualified: { bg: '#10B981', abbr: 'QL' },
  Negotiating: { bg: '#F59E0B', abbr: 'NG' },
  Won: { bg: '#0D9488', abbr: 'WN' },
  Lost: { bg: '#94A3B8', abbr: 'LT' },
};

const Dot = ({ stage }: { stage: string }) => {
  const color = STAGE_COLORS[stage];
  if (!color) return null;
  return (
    <span className="lb-filter-dot" style={{ background: color.bg }}>
      {color.abbr}
    </span>
  );
};

const FilterBar = () => {
  const {
    activeStage,
    setActiveStage,
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection,
    totalCount,
  } = useContext(FilterGridContext);

  const stages = Object.keys(STAGE_COLORS);

  return (
    <div className="lb-filter-outer">
      <div className="lb-filter-content">
        <div className="lb-filter-label">
          <span>Filter:</span>
        </div>
        <div className="lb-filter-buttons-wrapper">
          <button
            className={`lb-filter-pill ${activeStage === null ? 'lb-filter-pill-active' : 'lb-filter-pill-inactive'}`}
            onClick={() => setActiveStage(null)}
          >
            All Properties {activeStage === null && `( ${totalCount} )`}
          </button>

          {stages.map(stage => (
            <button
              key={stage}
              className={`lb-filter-pill ${activeStage === stage ? 'lb-filter-pill-active' : 'lb-filter-pill-inactive'}`}
              onClick={() => setActiveStage(stage)}
            >
              <Dot stage={stage} /> {stage} {activeStage === stage && `( ${totalCount} )`}
            </button>
          ))}
        </div>
        <div className="lb-filter-spacer"></div>
        <div className="lb-filter-sort-controls">
          <select
            className="lb-filter-select"
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
          >
            <option value="expiration">Sort: Lease Expiration</option>
            <option value="name">Sort: Company Name</option>
            <option value="size">Sort: Property Size</option>
          </select>
          <Sort value={sortDirection} onChange={setSortDirection} />
        </div>
      </div>
    </div>
  );
};

export default memo(FilterBar);
