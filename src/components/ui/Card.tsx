import React from 'react';

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
    style={{ width: $width, height: $height, ...style }}
    {...props}
  >
    {children}
  </div>
);

export default Card;
