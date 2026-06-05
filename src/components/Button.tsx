import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';

  const variantClasses = {
    primary:
      'bg-apple-blue text-white hover:bg-apple-blue-hover active:opacity-90 focus:ring-apple-blue/30 shadow-apple-md hover:shadow-apple-glow-blue hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-apple-surface text-apple-text border border-apple-border-strong hover:border-apple-blue hover:text-apple-blue active:bg-apple-bg focus:ring-apple-blue/20',
    ghost:
      'text-apple-text-secondary hover:text-apple-blue hover:bg-apple-blue-light active:bg-apple-blue-light focus:ring-apple-blue/20',
    danger:
      'bg-apple-red text-white hover:opacity-90 active:bg-red-600 focus:ring-apple-red/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};
