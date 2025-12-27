import { useState } from 'react';
import styled from 'styled-components';
import { ArrowUpDown, ArrowDownUp } from 'lucide-react';

const SortButton = styled.button`
  display: flex;
  align-items: center;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  box-shadow: none;
  cursor: pointer;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
  }

  &:active {
    background: none;
  }
`;

export default function Sort() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <SortButton onClick={toggleSortOrder}>
      {sortOrder === 'asc' ? <ArrowUpDown /> : <ArrowDownUp />}
    </SortButton>
  );
}