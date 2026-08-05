import { memo, useContext } from 'react';
import { FilterGridContext } from '../../context';
import type { SortOption } from '../../context/FilterGridContext';
import type { Stage } from '../../types/lease';
import { STAGE_COLORS, STAGE_ORDER, stageLabel } from '../../utils/stageColors';
import { Sort, ViewToggle } from '../ui';
import './FilterBar.css';

const Dot = ({ stage }: { stage: Stage }) => {
  const color = STAGE_COLORS[stage];
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
    stageCounts,
  } = useContext(FilterGridContext);

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
            All Properties ( {stageCounts.total} )
          </button>

          {STAGE_ORDER.map(stage => (
            <button
              key={stage}
              className={`lb-filter-pill ${activeStage === stage ? 'lb-filter-pill-active' : 'lb-filter-pill-inactive'}`}
              onClick={() => setActiveStage(stage)}
            >
              <Dot stage={stage} /> {stageLabel(stage)} ( {stageCounts[stage]} )
            </button>
          ))}
        </div>
        <div className="lb-filter-spacer"></div>
        <ViewToggle />
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
