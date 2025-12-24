import styled from 'styled-components';

interface CardProps {
  $width?: string;
  $height?: string;
}

const Card = styled.div<CardProps>`
  background-color: #fff;
  border: 1px solid #edf2f7;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  display: flex;
  transition: box-shadow 0.2s ease;
  padding: calc(0.25rem * 4);
  width: ${props => props.$width};
  height: ${props => props.$height};
`;

export default Card;
