import styled, { css } from 'styled-components';
import { Plus as _Plus } from 'lucide-react';

interface ButtonProps {
  $variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.md};
  gap: 8px;
  padding: 0 1rem;
  margin-right: 25px;
  cursor: pointer;
  height: 2.25rem;

  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 150ms ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);

  &:hover {
    background: rgb(6, 95, 210);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus {
    outline: none;
    box-shadow:
      0 0 0 2px ${({ theme }) => theme.colors.muted},
      0 0 0 4px ${({ theme }) => theme.colors.primary};
  }

  &.filter {
    background: #cbcecf;
    color: black;
  }

  ${({ $variant = 'default', theme }) => {
    switch ($variant) {
      case 'destructive':
        return css`
          background-color: ${theme.colors.danger};
          color: #ffffff;
          border: none;
          &:hover {
            opacity: 0.9;
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          border: 1px solid ${theme.colors.border};
          color: ${theme.colors.text};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* Slight shadow for outline */
          &:hover {
            background-color: ${theme.colors.muted};
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${theme.colors.text};
          border: none;
          box-shadow: none;
          &:hover {
            background-color: ${theme.colors.muted};
          }
        `;
      default: // Primary
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.primaryForeground};
          border: none;
          &:hover {
            opacity: 0.9;
          }
        `;
    }
  }}
`;

export default Button;
