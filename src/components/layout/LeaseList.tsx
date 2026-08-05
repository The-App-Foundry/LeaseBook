import { memo, useContext } from 'react';
import { FilterGridContext } from '../../context';
import type { Lease } from '../../types/lease';
import { getExpirationMeta } from '../../utils/leaseStatus';
import { STAGE_COLORS, stageLabel } from '../../utils/stageColors';
import './LeaseList.css';

interface LeaseListProps {
  onPropertyClick?: (id: number) => void;
}

/**
 * Hex alpha suffix applied to a stage's solid color to produce the chip
 * background. `#3B82F6` + `1A` ≈ 10% opacity, which reads as a tint against
 * white while the solid color stays legible as the chip's text.
 */
const CHIP_ALPHA = '1A';

/**
 * Placeholder for a missing value. Matches `RULESET.noExpiration.tag`, which is
 * an em dash — `dbLeaseToUi` writes an ASCII `'-'` into `leaseExpiration` when
 * there is no date, so rendering it raw puts `-` and `—` side by side in the
 * same row.
 */
const EM_DASH = '—';

/** Normalise the context's ASCII no-date sentinel to the em dash. */
const formatExpiration = (raw: string | undefined): string =>
  !raw || raw === '-' ? EM_DASH : raw;

/**
 * Primary contact for a lease.
 *
 * `Lease.leaseManager` is deliberately NOT used: the context joins every
 * manager name into one string, and this column shows a single person.
 */
const primaryManagerName = (lease: Lease): string => {
  const primary = lease.managers.find(manager => manager.isPrimary) ?? lease.managers[0];
  return primary?.name ?? '—';
};

/** Mirrors `Property.tsx` so the two views never format a size differently. */
const formatSize = (size: string | undefined): string =>
  size && size.toLowerCase().includes('sq ft') ? size : `${size || '0'} sq ft`;

/**
 * Tabular counterpart to the `Property` card grid.
 *
 * Reads `leases` from `FilterGridContext` directly — it renders the same page
 * of rows the card grid would, so pagination stays owned by `GridContainer`
 * and is shared between both view modes.
 *
 * Headers are intentionally inert: the backend paginates server-side while
 * `sortLeases` only orders the current page, so click-to-sort headers would
 * visibly mis-sort past page 1. `FilterBar` remains the sole sort affordance.
 */
const LeaseList = ({ onPropertyClick }: Readonly<LeaseListProps>) => {
  const { leases } = useContext(FilterGridContext);

  return (
    <div className="lb-lease-list">
      <div className="table-responsive">
        <table className="lb-lease-table">
          <thead>
            <tr>
              <th scope="col" className="lb-col-stage">
                STAGE
              </th>
              <th scope="col" className="lb-col-company">
                COMPANY
              </th>
              <th scope="col" className="lb-col-expiration">
                LEASE EXPIRATION
              </th>
              <th scope="col" className="lb-col-status">
                STATUS
              </th>
              <th scope="col" className="lb-col-manager">
                DECISION MAKER
              </th>
              <th scope="col" className="lb-col-size">
                SIZE
              </th>
            </tr>
          </thead>
          <tbody>
            {leases.length === 0 && (
              <tr>
                <td colSpan={6} className="lb-lease-empty-cell">
                  <div className="lb-grid-empty" role="status">
                    No properties
                  </div>
                </td>
              </tr>
            )}

            {leases.map(lease => {
              const meta = getExpirationMeta(lease);
              const stageColor = STAGE_COLORS[lease.stage].bg;

              return (
                <tr
                  key={lease.id}
                  className="lb-lease-row"
                  tabIndex={0}
                  onClick={() => onPropertyClick?.(lease.id)}
                  onKeyDown={event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    // Space would otherwise scroll the page out from under the row.
                    event.preventDefault();
                    onPropertyClick?.(lease.id);
                  }}
                >
                  <td className="lb-cell-stage">
                    <span
                      className="lb-stage-chip"
                      style={{ background: `${stageColor}${CHIP_ALPHA}`, color: stageColor }}
                    >
                      {stageLabel(lease.stage)}
                    </span>
                  </td>

                  <td className="lb-cell-company">
                    <div className="lb-lease-company-name">{lease.name}</div>
                    <div className="lb-lease-company-address">{lease.businessAddr}</div>
                  </td>

                  <td className="lb-cell-expiration" style={{ color: meta.dateColor }}>
                    {formatExpiration(lease.leaseExpiration)}
                  </td>

                  <td className="lb-cell-status">
                    {meta.isPill ? (
                      <span
                        className="lb-status-pill"
                        style={{ background: meta.tagBg, color: meta.tagColor }}
                      >
                        {meta.tag}
                      </span>
                    ) : (
                      <span className="lb-status-text" style={{ color: meta.tagColor }}>
                        {meta.tag}
                      </span>
                    )}
                  </td>

                  <td className="lb-cell-manager">{primaryManagerName(lease)}</td>

                  <td className="lb-cell-size">{formatSize(lease.size)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(LeaseList);
