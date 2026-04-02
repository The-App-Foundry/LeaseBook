import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Dropdown as BsDropdown } from 'react-bootstrap';
import styled from 'styled-components';
import { ChevronDown } from 'lucide-react';

interface DropdownMenuProps {
  buttonLabel: React.ReactNode;
  showChevron?: boolean;
  triggerLabel?: string;
  items: {
    title: string;
    icon?: React.ReactNode;
    action?: () => void;
  }[];
}

const StyledToggle = styled(BsDropdown.Toggle)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  color: inherit !important;
  font-size: 12px;
  height: calc(var(--spacing) * 10);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2) !important;

  &::after {
    display: none;
  }

  &:focus,
  &:active {
    outline: none !important;
    box-shadow: none !important;
  }
`;

export default function Dropdown({
  buttonLabel,
  showChevron = true,
  triggerLabel,
  items,
}: Readonly<DropdownMenuProps>) {
  return (
    <BsDropdown>
      <StyledToggle aria-label={triggerLabel}>
        {buttonLabel}
        {showChevron && <ChevronDown size={15} />}
      </StyledToggle>
      <BsDropdown.Menu>
        {items.map(item => (
          <BsDropdown.Item key={item.title} onClick={item.action}>
            {item.icon}
            {item.title}
          </BsDropdown.Item>
        ))}
      </BsDropdown.Menu>
    </BsDropdown>
  );
}
