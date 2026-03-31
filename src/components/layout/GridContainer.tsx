import { useRef } from 'react';
import styled from 'styled-components';
import Property from './Property';
import { Lease, Manager } from '../../types/lease';

interface GridContainerProps {
  leases: Lease[];
  onManagersChange?: (leaseIndex: number, managers: Manager[]) => void;
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  align-items: start;
  gap: calc(var(--spacing) * 4);
  width: 100%;
  box-sizing: border-box;
  margin: 16px 0;
  padding: 0 16px;
`;

export default function GridContainer({ leases, onManagersChange }: Readonly<GridContainerProps>) {
  // Always points to the latest onManagersChange without changing identity
  const onChangeRef = useRef(onManagersChange);
  onChangeRef.current = onManagersChange;

  // Stable per-index callbacks — created once per slot, so React.memo on Property works
  const callbacksRef = useRef<Array<(managers: Manager[]) => void>>([]);
  for (let i = callbacksRef.current.length; i < leases.length; i++) {
    const idx = i;
    callbacksRef.current[idx] = (managers: Manager[]) => onChangeRef.current?.(idx, managers);
  }

  return (
    <Container>
      {leases.map((l, i) => (
        <Property key={i} data={l} onManagersChange={callbacksRef.current[i]} />
      ))}
    </Container>
  );
}
