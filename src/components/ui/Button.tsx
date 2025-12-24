import styled from 'styled-components';
import { Plus as _Plus } from 'lucide-react';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  gap: 8px;
  padding: calc(0.25rem * 2) calc(0.25rem * 4);
  margin-right: 25px;
  cursor: pointer;
  height: 40px;
  color: #fff;
  border: none;
  font-size: 14px;
  background: #3182ce;
  white-space: nowrap;
  transition:
    background-color 150ms ease,
    transform 80ms ease,
    box-shadow 150ms ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);

  &:hover {
    background: rgb(6, 95, 210);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
  }

  &.filter {
    background: #cbcecf;
    color: black;
  }
`;

export default Button;
