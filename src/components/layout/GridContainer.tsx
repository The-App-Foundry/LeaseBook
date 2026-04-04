import { useRef } from 'react';
import Property from './Property';
import { Lease, Manager } from '../../types/lease';

interface GridContainerProps {
  leases: Lease[];
  onManagersChange?: (leaseIndex: number, managers: Manager[]) => void;
}

const GridContainer = ({ leases, onManagersChange }: Readonly<GridContainerProps>) => {
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
    <div className="lb-property-grid">
      {leases.map((l, i) => (
        <Property key={i} data={l} onManagersChange={callbacksRef.current[i]} />
      ))}
    </div>
  );
};

export default GridContainer;
