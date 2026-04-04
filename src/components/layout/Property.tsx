import React, { useState } from 'react';
import { Building2, Calendar, User, Maximize2, Maximize, X, NotebookPen } from 'lucide-react';
import { Lease, Manager } from '../../types/lease';
import LeaseManagersModal from './LeaseManagersModal';

interface PropertyProps {
  data: Lease;
  onManagersChange?: (managers: Manager[]) => void;
}

const COLLAPSED_HEIGHT = '340px';

// Pure module-level helper — avoids recreation on every render
const getStatusColor = (s: string): string => {
  const v = s.toLowerCase();
  if (v.includes('qualified')) return '#10b981'; // green
  if (v.includes('prospect')) return '#3b82f6'; // blue
  return '#6b7280'; // neutral gray fallback
};

// Matches common phone number formats, e.g. +1 (800) 555-1234, 555.867.5309, etc.
const PHONE_REGEX = /(\+?\b\d[\d\s\-().]{6,}\d\b)/g;

const formatNoteText = (text: string): React.ReactNode[] => {
  // split() with a capturing group interleaves non-matches and captures:
  // [non-match, phone, non-match, phone, ...]
  const parts = text.split(PHONE_REGEX);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={`phone-${part}`} style={{ whiteSpace: 'nowrap' }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={`text-${part}-${i}`}>{part}</React.Fragment>
    ),
  );
};

const Property = ({ data, onManagersChange }: Readonly<PropertyProps>) => {
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
  const initial = status ? status[0].toUpperCase() : '?';
  const isExpired = status === 'prospect';

  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Determine verification status from managers array
  const allVerified = managers.length > 0 && managers.every(m => m.verified);

  return (
    <div
      className={`lb-card-slot${expanded ? ' expanded' : ''}`}
      style={expanded ? { minHeight: COLLAPSED_HEIGHT } : undefined}
    >
      {expanded && (
        <button
          className="lb-backdrop"
          aria-label="Close card"
          onClick={() => setExpanded(false)}
        />
      )}

      <div className={`lb-property-card${expanded ? ' expanded' : ''}`}>
        {/* Card header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          <button
            className="lb-expand-btn"
            onClick={() => setExpanded(prev => !prev)}
            aria-label={expanded ? 'Collapse card' : 'Expand card'}
          >
            {expanded ? <X size={14} /> : <Maximize size={14} />}
          </button>
        </div>

        {/* Top row: status badge + property info */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', minHeight: 90 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', minWidth: 60 }}>
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: getStatusColor(status),
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
            <span style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'capitalize' }}>
              {status}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#111827',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                color: '#6b7280',
                fontSize: '0.85rem',
                lineHeight: 1.3,
                overflow: 'hidden',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
            >
              <Building2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              {businessAddr}
            </div>
          </div>
        </div>

        {/* Expiration highlight */}
        <div
          style={{
            backgroundColor: isExpired ? '#fff1f2' : '#f0fdf4',
            border: `1px solid ${isExpired ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '0.6rem',
            padding: '0.6rem 0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: isExpired ? '#b91c1c' : '#065f46',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            <Calendar size={16} />
            {leaseExpiration}
          </div>
          {isExpired && (
            <span
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: '0.65rem',
                fontWeight: 800,
              }}
            >
              EXPIRED
            </span>
          )}
        </div>

        {/* Detail grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.6rem', minWidth: 0, overflow: 'hidden' }}>
            <User size={16} color="#9ca3af" />
            <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Lease&nbsp;Manager
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: allVerified ? '#1f2937' : 'var(--lb-danger)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {leaseManager}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', minWidth: 0, overflow: 'hidden' }}>
            <Maximize2 size={16} color="#9ca3af" />
            <div style={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Property Size
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {size}
              </div>
            </div>
          </div>
        </div>

        {/* Note indicator (collapsed only) */}
        {!expanded && note && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
            <NotebookPen size={12} />
            Has notes
          </div>
        )}

        {/* Note area (expanded only) */}
        {expanded && (
          <div
            style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.6rem',
              padding: '0.6rem',
              marginTop: 'auto',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: 2 }}>Notes</div>
            <div style={{ fontSize: '0.8rem', color: '#4b5563', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              {note ? formatNoteText(note) : ' '}
            </div>
          </div>
        )}

        <LeaseManagersModal
          isOpen={dmModalOpen}
          onClose={() => setDmModalOpen(false)}
          managers={managers}
          onUpdate={updated => onManagersChange?.(updated)}
        />
      </div>
    </div>
  );
};

export default React.memo(Property);
