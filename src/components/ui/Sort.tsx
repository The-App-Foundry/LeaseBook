import { useState } from 'react';
import styled from 'styled-components';
import { ArrowUpDown, ArrowDownUp } from 'lucide-react';

const SortButton = styled.button`
  display: flex;
  align-items: center;
  box-shadow: none;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
  }

  &:active {
    background: none;
  }
`;

const AUpDown = styled(ArrowDownUp)`
  height: 15px;
`;

const ADownUp = styled(ArrowUpDown)`
  height: 15px;
`;

export default function Sort() {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <SortButton onClick={toggleSortOrder}>
      {sortOrder === 'asc' ? <AUpDown /> : <ADownUp />}
    </SortButton>
  );
}