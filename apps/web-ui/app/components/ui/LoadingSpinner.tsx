import React from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'light' | 'dark' | 'primary';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

const variantClasses: Record<SpinnerVariant, string> = {
  light: 'border-white/30 border-t-white',
  dark: 'border-stone-300 border-t-orange-600',
  primary: 'border-orange-600/30 border-t-orange-600',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'dark',
  className = '',
}) => {
  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
