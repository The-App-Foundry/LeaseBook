import styled from 'styled-components';

const Badge = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: calc(0.25rem * 6);
  height: calc(0.25rem * 6);
  border-radius: 9999px;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 5px;

  &.emerald {
    background: rgb(16 185 129);
  }

  &.gray {
    background: #b3bac2;
  }

  &.trans {
    background: transparent;
  }
`;

export default Badge;
