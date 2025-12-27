import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DropdownMenuProps {
  buttonLabel: string;
  items: {
    title: string;
    icon?: React.ReactNode;
    action?: () => void;
  }[];
}

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  outline: none;
  cursor: pointer;
  font-size: 12px;
  height: calc(var(--spacing) * 10);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 2);

  &:focus {
    outline: none;
  }

  &:active {
    background: none;
  }
`;

const Menu = styled.div<{ $flipped?: boolean; $menuWidth?: number; $maxHeight?: number }>`
  position: absolute;
  left: -3.3px;
  transform: none;
  z-index: 20;
  width: 'auto';
  max-height: ${({ $maxHeight }) =>
    $maxHeight ? `${$maxHeight}px` : 'calc(100vh - calc(var(--spacing) * 8))'};
  overflow: auto;
  background: ${({ theme }) => theme.colors?.background ?? '#fff'};
  border-radius: 6px;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: calc(var(--spacing) * 1);
  width: 100%;
  box-sizing: border-box;
`;

const Item = styled.li`
  position: relative;
  display: flex;
  align-items: center;
  gap: 2;
  padding-top: var(--spacing);
  padding-bottom: var(--spacing);
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

const ChevUp = styled(ChevronUp)`
  width: 15px;
`;

const ChevDown = styled(ChevronDown)`
  width: 15px;
`;

export default function Dropdown({ buttonLabel, items }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuDivRef = useRef<HTMLDivElement | null>(null);

  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [open]);

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!open || !triggerRef.current || !menuDivRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const menuHeight = menuDivRef.current.offsetHeight;

      const spaceBelow = window.innerHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (menuHeight <= spaceBelow) {
        setFlipped(false);
      } else if (menuHeight <= spaceAbove) {
        setFlipped(true);
      } else {
        if (spaceBelow >= spaceAbove) {
          setFlipped(false);
        } else {
          setFlipped(true);
        }
      }
    };

    if (open) {
      requestAnimationFrame(updatePosition);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const handleToggle = () => {
    setOpen(prev => !prev);
  };

  return (
    <Container ref={menuRef}>
      <Trigger
        type="button"
        onClick={handleToggle}
        ref={triggerRef}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {buttonLabel}
        <span>{open ? <ChevUp /> : <ChevDown />}</span>
      </Trigger>
      {open && (
        <Menu
          ref={menuDivRef}
          $flipped={flipped}
          role="menu"
          aria-hidden={!open}
        >
          <List>
            {items.map((item, idx) => (
              <Item key={idx} role="menuitem" tabIndex={0}>
                {item.title}
              </Item>
            ))}
          </List>
        </Menu>
      )}
    </Container>
  );
}
