import React from 'react';
import { Dropdown as BsDropdown } from 'react-bootstrap';
import './Dropdown.css';

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
      className="lb-dropdown-toggle"
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
