import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseClasses =
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none gap-2';

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-6 py-3 text-sm',
  sm: 'px-4 py-2 text-sm',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'text-slate-900 bg-amber-400 hover:bg-amber-300 shadow-lg',
  secondary: 'text-slate-200 bg-slate-700 hover:bg-slate-600 shadow-md',
  ghost:
    'text-slate-300 border border-slate-600 bg-transparent hover:bg-slate-800/60 hover:text-slate-100 shadow-none',
  danger: 'text-white bg-red-500 hover:bg-red-600 shadow-md',
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
