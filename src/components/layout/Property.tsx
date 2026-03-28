import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Card } from '../ui';
import { Building2, Calendar, User, Maximize2, MoreVertical, Users } from 'lucide-react';
import { Lease, Manager } from '../../types/lease';
import LeaseManagersModal from './LeaseManagersModal';

interface PropertyProps {
  data: Lease;
  onManagersChange?: (managers: Manager[]) => void;
}

// Overrides the base Card styles to ensure vertical stacking and uniform height
const StyledCard = styled(Card)`
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  height: 100%;
  padding: 1.25rem;
  gap: 1rem;
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
`;

const PropertyTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
`;

const AddressRow = styled.div`
  display: flex;
  gap: 0.4rem;
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.3;
`;

const ExpirationHighlight = styled.div`
  background-color: #fff1f2;
  border: 1px solid #fecaca;
  border-radius: 0.6rem;
  padding: 0.6rem 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExpDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b91c1c;
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
`;

const DetailLabel = styled.div`
  font-size: 0.7rem;
  color: #6b7280;
`;

const DetailValue = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
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

// Matches common phone number formats, e.g. +1 (800) 555-1234, 555.867.5309, etc.
const PHONE_REGEX = /(\+?\b\d[\d\s\-().]{6,}\d\b)/g;

function formatNoteText(text: string): React.ReactNode[] {
  // split() with a capturing group interleaves non-matches and captures:
  // [non-match, phone, non-match, phone, ...]
  const parts = text.split(PHONE_REGEX);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ whiteSpace: 'nowrap' }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

const CardHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
`;

const MenuBtn = styled.button`
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
  }
`;

const MenuPanel = styled.div`
  position: absolute;
  right: 0;
  top: 2rem;
  z-index: 10;
  min-width: 180px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  padding: 0.25rem 0;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  font-size: 0.825rem;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.muted};
  }
`;

const LeaseManagerValue = styled.div<{ $verified: boolean }>`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ $verified, theme }) => ($verified ? '#1f2937' : theme.colors.danger)};
`;

export default function Property({ data, onManagersChange }: Readonly<PropertyProps>) {
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

  const [menuOpen, setMenuOpen] = useState(false);
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine verification status from managers array
  const allVerified = managers.length > 0 && managers.every(m => m.verified);

  // Close hamburger on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Map statuses to colors (Qualified = green, Prospect = blue)
  const getStatusColor = (s: string) => {
    const v = s.toLowerCase();
    if (v.includes('qualified')) return '#10b981'; // green
    if (v.includes('prospect')) return '#3b82f6'; // blue
    return '#6b7280'; // neutral gray fallback
  };

  return (
    <StyledCard>
      <CardHeader ref={menuRef}>
        <MenuBtn
          onClick={() => setMenuOpen(prev => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Card actions"
        >
          <MoreVertical size={16} />
        </MenuBtn>
        {menuOpen && (
          <MenuPanel role="menu">
            <MenuItem
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setDmModalOpen(true);
              }}
            >
              <Users size={14} />
              Manage Lease Managers
            </MenuItem>
          </MenuPanel>
        )}
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

      <ExpirationHighlight>
        <ExpDate>
          <Calendar size={16} />
          {leaseExpiration}
        </ExpDate>
        <ExpPill>EXPIRED</ExpPill>
      </ExpirationHighlight>

      <GridDetails>
        <DetailBlock>
          <User size={16} color="#9ca3af" />
          <div>
            <DetailLabel>Lease&nbsp;Manager</DetailLabel>
            <LeaseManagerValue $verified={allVerified}>{leaseManager}</LeaseManagerValue>
          </div>
        </DetailBlock>
        <DetailBlock>
          <Maximize2 size={16} color="#9ca3af" />
          <div>
            <DetailLabel>Property Size</DetailLabel>
            <DetailValue>{size}</DetailValue>
          </div>
        </DetailBlock>
      </GridDetails>

      <NoteArea>
        <NoteTitle>Notes</NoteTitle>
        <NoteText>{note ? formatNoteText(note) : ' '}</NoteText>
      </NoteArea>

      <LeaseManagersModal
        isOpen={dmModalOpen}
        onClose={() => setDmModalOpen(false)}
        managers={managers}
        onUpdate={updated => onManagersChange?.(updated)}
      />
    </StyledCard>
  );
}
