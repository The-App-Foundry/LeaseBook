import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

const variantClass: Record<NonNullable<ButtonProps['$variant']>, string> = {
  default: 'btn-primary',
  outline: 'btn-outline-secondary',
  ghost: 'btn-link',
  destructive: 'btn-danger',
};

const Button = ({
  $variant = 'default',
  className = '',
  children,
  ...props
}: Readonly<ButtonProps>) => {
  const classNameSuffix = className ? ` ${className}` : '';
  const finalClassName = `btn text-nowrap ${variantClass[$variant]}${classNameSuffix}`;
  return (
    <button className={finalClassName} {...props}>
      {children}
    </button>
  );
};

export default Button;
