import styled from 'styled-components';
import { Search as _Search } from 'lucide-react';

export interface SearchBarProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}

const Container = styled.div`
  position: relative;
  width: 60%;
`;

const Search = styled(_Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 8px 12px 8px 2.5rem;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  font-size: 14px;
  width: 100%;

  &:focus {
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  }
`;

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}: Readonly<SearchBarProps>) {
  return (
    <Container>
      <Search aria-hidden="true" />
      <Input
        role="searchbox"
        aria-label={placeholder}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </Container>
  );
}
