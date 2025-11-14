import React from 'react';

export type CardVariant = 'default' | 'highlighted';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-slate-800/60 border-emerald-700/40',
  highlighted: 'bg-slate-800/80 border-emerald-600/60',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <div
      className={`
        backdrop-blur-sm
        p-6
        rounded-lg
        shadow-xl
        border
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
