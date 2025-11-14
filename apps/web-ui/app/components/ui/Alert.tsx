import React from 'react';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  className?: string;
}

const variantClasses: Record<AlertVariant, { bg: string; border: string; text: string }> = {
  error: {
    bg: 'bg-red-900/30',
    border: 'border-red-600/40',
    text: 'text-red-200',
  },
  warning: {
    bg: 'bg-orange-900/30',
    border: 'border-orange-500/40',
    text: 'text-orange-400',
  },
  success: {
    bg: 'bg-emerald-900/30',
    border: 'border-emerald-600/40',
    text: 'text-emerald-200',
  },
  info: {
    bg: 'bg-slate-800/60',
    border: 'border-emerald-700/40',
    text: 'text-stone-200',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  className = '',
}) => {
  const styles = variantClasses[variant];

  return (
    <div
      className={`
        ${styles.bg}
        ${styles.border}
        border
        rounded-lg
        p-4
        backdrop-blur-sm
        ${className}
      `}
      role="alert"
    >
      {title && (
        <h3 className={`font-semibold mb-1 ${styles.text}`}>
          {title}
        </h3>
      )}
      <p className={styles.text}>
        {message}
      </p>
    </div>
  );
};
