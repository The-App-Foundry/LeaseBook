import { memo, useContext } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { FilterGridContext } from '../../context';
import type { ViewMode } from '../../context/FilterGridContext';
import './ViewToggle.css';

/** One segment of the toggle. Declared `as const` so `mode` stays a `ViewMode`. */
const OPTIONS = [
  { mode: 'cards', label: 'Cards', Icon: LayoutGrid },
  { mode: 'list', label: 'List', Icon: List },
] as const satisfies ReadonlyArray<{ mode: ViewMode; label: string; Icon: typeof LayoutGrid }>;

/**
 * Segmented Cards/List switch for the property grid.
 *
 * Takes no props on purpose: `viewMode` is a presentation concern owned by
 * `FilterGridContext` (and persisted to `localStorage` there), so threading it
 * through `FilterBar` would only create a second source of truth.
 */
const ViewToggle = () => {
  const { viewMode, setViewMode } = useContext(FilterGridContext);

  return (
    <div className="lb-view-toggle" role="group" aria-label="View mode">
      {OPTIONS.map(({ mode, label, Icon }) => {
        const active = viewMode === mode;
        return (
          <button
            key={mode}
            type="button"
            className={`lb-view-toggle-btn${active ? ' lb-view-toggle-btn-active' : ''}`}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setViewMode(mode)}
          >
            <Icon size={15} strokeWidth={2.2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
};

export default memo(ViewToggle);
