import React from 'react';

const Badge = ({
  className = '',
  children,
  ...props
}: Readonly<React.HTMLAttributes<HTMLSpanElement>>) => (
  <span className={`lb-badge${className ? ` ${className}` : ''}`} {...props}>
    {children}
  </span>
);

export default Badge;
