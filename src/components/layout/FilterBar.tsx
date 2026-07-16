import { memo } from 'react';
import './FilterBar.css';

const STAGE_COLORS: Record<string, { bg: string, abbr: string }> = {
  'New':          { bg: '#94A3B8', abbr: 'NW' },
  'Contacted':    { bg: '#3B82F6', abbr: 'CN' },
  'Qualified':    { bg: '#10B981', abbr: 'QL' },
  'Negotiating':  { bg: '#F59E0B', abbr: 'NG' },
  'Won':          { bg: '#0D9488', abbr: 'WN' },
  'Lost':         { bg: '#94A3B8', abbr: 'LT' },
};

const Dot = ({ stage }: { stage: string }) => {
  const color = STAGE_COLORS[stage];
  if (!color) return null;
  return (
    <span 
      className="lb-filter-dot" 
      style={{ background: color.bg }}
    >
      {color.abbr}
    </span>
  );
};

const FilterBar = () => (
  <div className="lb-filter-outer">
    <div className="lb-filter-content">
      <div className="lb-filter-label">
        <span>Filter:</span>
      </div>
      <div className="lb-filter-buttons-wrapper">
        <button className="lb-filter-pill lb-filter-pill-active">All Properties ( 12 )</button>
        <button className="lb-filter-pill lb-filter-pill-inactive"><Dot stage="New" /> New ( 2 )</button>
        <button className="lb-filter-pill lb-filter-pill-inactive"><Dot stage="Contacted" /> Contacted ( 2 )</button>
        <button className="lb-filter-pill lb-filter-pill-inactive"><Dot stage="Qualified" /> Qualified ( 3 )</button>
        <button className="lb-filter-pill lb-filter-pill-inactive"><Dot stage="Negotiating" /> Negotiating ( 2 )</button>
        <button className="lb-filter-pill lb-filter-pill-inactive"><Dot stage="Won" /> Won ( 2 )</button>
        <button className="lb-filter-pill lb-filter-pill-inactive"><Dot stage="Lost" /> Lost ( 1 )</button>
      </div>
      <div className="lb-filter-spacer"></div>
      <select className="lb-filter-select">
        <option value="expiration">Sort: Lease Expiration</option>
        <option value="name">Sort: Company Name</option>
        <option value="size">Sort: Property Size</option>
      </select>
    </div>
  </div>
);

export default memo(FilterBar);
