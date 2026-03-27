import styled from 'styled-components';
import Property from './Property';
import { Lease, Manager } from '../../types/lease';

interface GridContainerProps {
  leases: Lease[];
  onManagersChange?: (leaseIndex: number, managers: Manager[]) => void;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: calc(var(--spacing) * 4);
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;
  margin: 16px 0;
  padding: 0 16px;
`;

export default function GridContainer({ leases, onManagersChange }: Readonly<GridContainerProps>) {
  return (
    <Container>
      {leases.map((l, i) => (
        <Property key={i} data={l} onManagersChange={managers => onManagersChange?.(i, managers)} />
      ))}
    </Container>
  );
}
