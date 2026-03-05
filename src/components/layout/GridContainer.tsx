import styled from 'styled-components';
import Property from './Property';
import { leases } from '../../data/leases';

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

export default function GridContainer() {
  return (
    <Container>
      {leases.map((l, i) => (
        <Property key={i} data={l} />
      ))}
    </Container>
  );
}
