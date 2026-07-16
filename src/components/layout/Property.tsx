import React, { useState, useRef, useLayoutEffect, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { confirm } from '@tauri-apps/plugin-dialog';
import { Lease, Manager } from '../../types/lease';
import './Property.css';
interface PropertyProps {
  data: Lease;
  onManagersChange?: (managers: Manager[]) => void;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}


// Matches common phone number formats, e.g. +1 (800) 555-1234, 555.867.5309, etc.
const PHONE_REGEX = /(\+?\b\d[\d\s\-().]{6,}\d\b)/g;

const stripHtml = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const formatNoteText = (text: string): React.ReactNode[] => {
  // split() with a capturing group interleaves non-matches and captures:
  // [non-match, phone, non-match, phone, ...]
  const parts = text.split(PHONE_REGEX);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={`phone-${part}-${i}`} className="lb-property-phone-span">
        {part}
      </span>
    ) : (
      <React.Fragment key={`text-${part}-${i}`}>{part}</React.Fragment>
    ),
  );
};

/**
 * Measures available height from the notes box ref, then binary-searches
 * the raw note string using a fully external, non-React-controlled probe
 * element. React's DOM is never touched during measurement, so there is
 * no risk of reconciliation errors or fiber reference invalidation.
 */
function useClampedNote(
  note: string | undefined,
  boxRef: React.RefObject<HTMLDivElement | null>,
): string | undefined {
  const [clamped, setClamped] = useState<string | undefined>(note);

  useLayoutEffect(() => {
    if (!note) {
      setClamped(undefined);
      return;
    }

    const box = boxRef.current;
    if (!box) {
      setClamped(note);
      return;
    }

    // Box inner padding: 8px top + 8px bottom = 16px vertical, 10px each side = 20px horizontal
    // "Notes" label: 11px font-size * ~1.2 natural line-height + 3px margin-bottom ≈ 16px
    const BOX_PAD_V = 16;
    const BOX_PAD_H = 20;
    const LABEL_H = 16;
    const maxH = box.clientHeight - BOX_PAD_V - LABEL_H;
    const textW = box.clientWidth - BOX_PAD_H;

    if (maxH <= 0 || textW <= 0) {
      setClamped(note);
      return;
    }

    // Create a temporary probe element completely outside React's control.
    // It is never attached to the React tree, so React cannot be confused
    // by its existence or removal.
    const probe = document.createElement('div');
    probe.style.cssText = [
      'position:absolute',
      'top:-9999px',
      'left:-9999px',
      'visibility:hidden',
      'pointer-events:none',
      `width:${textW}px`,
      'font-size:12px',
      'line-height:1.4',
      'word-break:break-word',
    ].join(';');
    document.body.appendChild(probe);

    // Check whether the full text fits without truncation.
    probe.textContent = note;
    if (probe.scrollHeight <= maxH) {
      document.body.removeChild(probe);
      setClamped(note);
      return;
    }

    // Binary search: find the longest prefix such that prefix + '...' fits.
    let lo = 0;
    let hi = note.length;
    while (lo < hi - 1) {
      const mid = Math.floor((lo + hi) / 2);
      probe.textContent = note.substring(0, mid) + '...';
      if (probe.scrollHeight <= maxH) {
        lo = mid;
      } else {
        hi = mid;
      }
    }

    document.body.removeChild(probe);
    setClamped(note.substring(0, lo) + '...');
  }, [note]); // eslint-disable-line react-hooks/exhaustive-deps

  return clamped;
}

const Property = ({ data, onClick, onEdit, onDelete }: Readonly<PropertyProps>) => {
  const {
    status,
    name,
    businessAddr,
    leaseExpiration,
    leaseManager,
    managers = [],
    size,
    note,
  } = data;

  const notesBoxRef = useRef<HTMLDivElement>(null);
  const plainNote = useMemo(() => note ? stripHtml(note) : undefined, [note]);
  const clampedNote = useClampedNote(plainNote, notesBoxRef);

  const getStatusBadge = (s: string) => {
    const v = s.toLowerCase();
    if (v.includes('qualified')) return { text: 'QL', color: '#10b981', label: 'QUALIFIED' };
    if (v.includes('prospect')) return { text: 'CN', color: '#3b82f6', label: 'CONTACTED' }; // fallback for prospect
    if (v.includes('negotiating')) return { text: 'NG', color: '#f59e0b', label: 'NEGOTIATING' };
    if (v.includes('won')) return { text: 'WN', color: '#10b981', label: 'WON' };
    if (v.includes('lost')) return { text: 'LT', color: '#6b7280', label: 'LOST' };
    if (v.includes('new')) return { text: 'NW', color: '#9ca3af', label: 'NEW' };
    return { text: '??', color: '#6b7280', label: s.toUpperCase() };
  };

  const badgeInfo = getStatusBadge(status);
  const isExpired = status === 'prospect'; // we keep this logic for now

  // Calculate days remaining or status string for the expiration badge
  let expirationBadgeText = isExpired ? 'EXPIRED' : '...';
  let expirationBadgeBg = isExpired ? '#ef4444' : '#fff';
  if (!isExpired) {
    // Just a placeholder calculation based on the string for now
    expirationBadgeText = 'ACTIVE';
  }

  // Determine verification status from managers array
  const allVerified = managers.length > 0 && managers.every(m => m.verified);

  return (
    <div
      className="lb-property-card-html"
      onClick={onClick}
    >
      {/* Edit icon — top-right corner */}
      {onEdit && (
        <button
          className="lb-card-edit-btn"
          title="Edit property"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label="Edit property"
        >
          <Pencil size={13} strokeWidth={2.2} />
        </button>
      )}

      {/* Delete icon — next to edit */}
      {onDelete && (
        <button
          className="lb-card-delete-btn"
          title="Delete property"
          onClick={async (e) => {
            e.stopPropagation();
            const yes = await confirm('Are you sure you want to delete this property?', {
              title: 'Delete Property',
              kind: 'warning',
            });
            if (yes) {
              onDelete();
            }
          }}
          aria-label="Delete property"
        >
          <Trash2 size={13} strokeWidth={2.2} />
        </button>
      )}
      <div className="lb-property-info-header">
        <div className="lb-property-badge" style={{ background: badgeInfo.color }}>
          {badgeInfo.text}
        </div>
        <div>
          <div className="lb-property-name">{name}</div>
          <div className="lb-property-address">
            <span>📍</span><span>{businessAddr}</span>
          </div>
        </div>
      </div>
      <div className="lb-property-badge-label">
        {badgeInfo.label}
      </div>

      <div className="lb-property-expiration-row" style={{ background: isExpired ? expirationBadgeBg : 'rgb(244, 245, 247)', border: `1px solid ${isExpired ? '#F7C9C9' : 'rgb(225, 227, 232)'}` }}>
        <div className="lb-property-expiration-info">
          <span className="lb-property-emoji">📅</span>
          <div>
            <div className="lb-property-exp-label" style={{ color: isExpired ? '#fff' : 'rgb(107, 114, 128)' }}>Lease Expiration</div>
            <div className="lb-property-exp-date" style={{ color: isExpired ? '#fff' : 'rgb(107, 114, 128)' }}>{leaseExpiration}</div>
          </div>
        </div>
        <div className="lb-property-exp-badge" style={{ background: isExpired ? '#D64545' : '#FFFFFF', color: isExpired ? '#FFFFFF' : '#0F7A55' }}>
          {expirationBadgeText}
        </div>
      </div>

      <div className="lb-property-details-row">
        <div className="lb-property-details-col">
          <div className="lb-property-details-label">👤 Decision Maker</div>
          <div className="lb-property-details-val-dm" style={{ color: allVerified ? '#1C2333' : '#D64545' }}>
            {leaseManager}
          </div>
        </div>
        <div className="lb-property-details-col">
          <div className="lb-property-details-label">↔ Property Size</div>
          <div className="lb-property-details-val-size">
            {size && size.toLowerCase().includes('sq ft') ? size : `${size || '0'} sq ft`}
          </div>
        </div>
      </div>

      <div
        ref={notesBoxRef}
        className="lb-property-notes-container"
      >
        <div className="lb-property-notes-label">Notes</div>
        <div
          className="lb-property-notes-content"
        >
          {clampedNote ? formatNoteText(clampedNote) : '\u00a0'}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Property);
