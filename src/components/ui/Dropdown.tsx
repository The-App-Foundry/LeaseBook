import React from 'react';
import { Dropdown as BsDropdown } from 'react-bootstrap';
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

const Dropdown = ({
  buttonLabel,
  triggerLabel,
  items,
}: Readonly<DropdownMenuProps>) => (
  <BsDropdown>
    <BsDropdown.Toggle
      aria-label={triggerLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        border: 'none',
        background: 'transparent',
        boxShadow: 'none',
        color: 'inherit',
        fontSize: 12,
        height: 'calc(var(--spacing) * 10)',
        padding: 'calc(var(--spacing) * 4) calc(var(--spacing) * 2)',
      }}
    >
      {buttonLabel}
    </BsDropdown.Toggle>
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

export default Dropdown;
