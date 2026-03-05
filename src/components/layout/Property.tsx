import styled from 'styled-components';
import { Card } from '../ui';
import { Building2, Calendar, User, Maximize2 } from 'lucide-react';
import { Lease } from '../../types/lease';

interface PropertyProps {
  data: Lease;
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

export default function Property({ data }: Readonly<PropertyProps>) {
  const { status, name, businessAddr, leaseExpiration, decisionMaker, size, note } = data;
  const initial = status ? status[0].toUpperCase() : '?';

  // Map statuses to colors (Qualified = green, Prospect = blue)
  const getStatusColor = (s: string) => {
    const v = s.toLowerCase();
    if (v.includes('qualified')) return '#10b981'; // green
    if (v.includes('prospect')) return '#3b82f6'; // blue
    return '#6b7280'; // neutral gray fallback
  };

  return (
    <StyledCard>
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
            <DetailLabel>Decision Maker</DetailLabel>
            <DetailValue>{decisionMaker}</DetailValue>
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
        <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>{note || ' '}</div>
      </NoteArea>
    </StyledCard>
  );
}
