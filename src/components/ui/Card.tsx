import React from 'react';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  $width?: string;
  $height?: string;
}

const Card = ({
  $width,
  $height,
  className = '',
  style,
  children,
  ...props
}: Readonly<CardProps>) => (
  <div
    className={`lb-card${className ? ` ${className}` : ''}`}
    style={{
      '--card-width': $width,
      '--card-height': $height,
      ...style,
    } as React.CSSProperties}
    {...props}
  >
    {children}
  </div>
);

export default Card;
