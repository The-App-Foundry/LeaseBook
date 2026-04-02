import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Card } from '../ui';
import { Building2, Calendar, User, Maximize2, Maximize, X, NotebookPen } from 'lucide-react';
import { Lease, Manager } from '../../types/lease';
import LeaseManagersModal from './LeaseManagersModal';

interface PropertyProps {
  data: Lease;
  onManagersChange?: (managers: Manager[]) => void;
}

const COLLAPSED_HEIGHT = '340px';

const flyIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -46%) scale(0.86);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 49;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
`;

/* Maintains the grid cell footprint while the card is floating */
const CardSlot = styled.div<{ $expanded: boolean }>`
  ${({ $expanded }) => $expanded && `min-height: ${COLLAPSED_HEIGHT};`}
`;

// Overrides the base Card styles to ensure vertical stacking and uniform height
const StyledCard = styled(Card)<{ $expanded: boolean }>`
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  overflow: ${({ $expanded }) => ($expanded ? 'auto' : 'hidden')};
  padding: 1.25rem;
  gap: 1rem;
  height: ${({ $expanded }) => ($expanded ? 'auto' : COLLAPSED_HEIGHT)};
  max-height: ${({ $expanded }) => ($expanded ? '85vh' : COLLAPSED_HEIGHT)};
  ${({ $expanded }) =>
    $expanded &&
    css`
      position: fixed;
      top: 50%;
      left: 50%;
      width: min(580px, 90vw);
      z-index: 50;
      border-radius: 1rem;
      animation: ${flyIn} 0.22s ease forwards;
    `}
`;

const ExpandIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: #6b7280;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.muted};
    color: #111827;
  }
`;

const TopRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  /* Fixed min-height ensures headers align even with long addresses */
  min-height: 90px;
`;

const StatusColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 60px;
`;

const LargeBadge = styled.div<{ $color?: string }>`
  width: 44px;
  height: 44px;
  background-color: ${props => props.$color || '#00b884'};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  font-weight: 700;
`;

const StatusLabel = styled.span`
  font-size: 0.7rem;
  color: #6b7280;
  text-transform: capitalize;
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const PropertyTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AddressRow = styled.div`
  display: flex;
  gap: 0.4rem;
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.3;
  overflow: hidden;
  overflow-wrap: break-word;
  word-break: break-word;
`;

const ExpirationHighlight = styled.div<{ $expired: boolean }>`
  background-color: ${({ $expired }) => ($expired ? '#fff1f2' : '#f0fdf4')};
  border: 1px solid ${({ $expired }) => ($expired ? '#fecaca' : '#bbf7d0')};
  border-radius: 0.6rem;
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExpDate = styled.div<{ $expired: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $expired }) => ($expired ? '#b91c1c' : '#065f46')};
  font-weight: 700;
  font-size: 1rem;
`;

const ExpPill = styled.span`
  background: #fee2e2;
  color: #b91c1c;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.65rem;
  font-weight: 800;
`;

const GridDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const DetailBlock = styled.div`
  display: flex;
  gap: 0.6rem;
  min-width: 0;
  overflow: hidden;
`;

const DetailContent = styled.div`
  min-width: 0;
  overflow: hidden;
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 0.7rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DetailValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoteIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const NoteArea = styled.div`
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.6rem;
  padding: 0.6rem;
  margin-top: auto; /* Pushes notes to the bottom of the card */
`;

const NoteTitle = styled.div`
  font-size: 0.7rem;
  color: #9ca3af;
  margin-bottom: 2px;
`;

const NoteText = styled.div`
  font-size: 0.8rem;
  color: #4b5563;
  overflow-wrap: break-word;
  word-break: break-word;
`;

// Pure module-level helper — avoids recreation on every render
function getStatusColor(s: string): string {
  const v = s.toLowerCase();
  if (v.includes('qualified')) return '#10b981'; // green
  if (v.includes('prospect')) return '#3b82f6'; // blue
  return '#6b7280'; // neutral gray fallback
}

// Matches common phone number formats, e.g. +1 (800) 555-1234, 555.867.5309, etc.
const PHONE_REGEX = /(\+?\b\d[\d\s\-().]{6,}\d\b)/g;

function formatNoteText(text: string): React.ReactNode[] {
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
}

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
`;

const LeaseManagerValue = styled.div<{ $verified: boolean }>`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ $verified, theme }) => ($verified ? '#1f2937' : theme.colors.danger)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function Property({ data, onManagersChange }: Readonly<PropertyProps>) {
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
    <CardSlot $expanded={expanded}>
      {expanded && <Backdrop onClick={() => setExpanded(false)} />}
      <StyledCard $expanded={expanded}>
        <CardHeader>
          <ExpandIconBtn
            onClick={() => setExpanded(prev => !prev)}
            aria-label={expanded ? 'Collapse card' : 'Expand card'}
          >
            {expanded ? <X size={14} /> : <Maximize size={14} />}
          </ExpandIconBtn>
        </CardHeader>

        <TopRow>
          <StatusColumn>
            <LargeBadge $color={getStatusColor(status)}>{initial}</LargeBadge>
            <StatusLabel>{status}</StatusLabel>
          </StatusColumn>
          <InfoColumn>
            <PropertyTitle>{name}</PropertyTitle>
            <AddressRow>
              <Building2 size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              {businessAddr}
            </AddressRow>
          </InfoColumn>
        </TopRow>

        <ExpirationHighlight $expired={isExpired}>
          <ExpDate $expired={isExpired}>
            <Calendar size={16} />
            {leaseExpiration}
          </ExpDate>
          {isExpired && <ExpPill>EXPIRED</ExpPill>}
        </ExpirationHighlight>

        <GridDetails>
          <DetailBlock>
            <User size={16} color="#9ca3af" />
            <DetailContent>
              <DetailLabel>Lease&nbsp;Manager</DetailLabel>
              <LeaseManagerValue $verified={allVerified}>{leaseManager}</LeaseManagerValue>
            </DetailContent>
          </DetailBlock>
          <DetailBlock>
            <Maximize2 size={16} color="#9ca3af" />
            <DetailContent>
              <DetailLabel>Property Size</DetailLabel>
              <DetailValue>{size}</DetailValue>
            </DetailContent>
          </DetailBlock>
        </GridDetails>

        {!expanded && note && (
          <NoteIndicator>
            <NotebookPen size={12} />
            Has notes
          </NoteIndicator>
        )}

        {expanded && (
          <NoteArea>
            <NoteTitle>Notes</NoteTitle>
            <NoteText>{note ? formatNoteText(note) : ' '}</NoteText>
          </NoteArea>
        )}

        <LeaseManagersModal
          isOpen={dmModalOpen}
          onClose={() => setDmModalOpen(false)}
          managers={managers}
          onUpdate={updated => onManagersChange?.(updated)}
        />
      </StyledCard>
    </CardSlot>
  );
}

export default React.memo(Property);
