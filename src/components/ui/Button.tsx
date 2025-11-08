import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4E883] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none gap-2';

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-3 text-sm',
  sm: 'px-4 py-2 text-sm',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'text-[#011626] bg-[#FFD700] hover:bg-[#F4E883] shadow-[0_10px_25px_rgba(255,215,0,0.35)]',
  secondary:
    'text-[#FFD700] bg-[#01192C] hover:bg-[#022840] border border-[#F4E883]/50 shadow-[0_8px_20px_rgba(0,0,0,0.35)]',
  ghost:
    'text-[#FFD700] border border-[#F4E883]/60 bg-transparent hover:bg-[#011626] shadow-none',
  danger: 'text-white bg-red-600 hover:bg-red-700 shadow-md',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const classes = [baseClasses, sizeClasses[size], variantClasses[variant], className]
    .filter(Boolean)
    .join(' ');

  return <button className={classes} {...props} />;
};

export default Button;
