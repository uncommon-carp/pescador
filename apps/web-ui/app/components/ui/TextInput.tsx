import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-3 py-2 text-base rounded-md',
  lg: 'px-6 py-4 text-lg rounded-xl',
};

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, inputSize = 'md', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-stone-200 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full
            bg-slate-800/40
            backdrop-blur-md
            border
            border-emerald-700/50
            text-stone-100
            placeholder-stone-400
            shadow-lg
            transition-all
            duration-300
            focus:bg-slate-800/60
            focus:border-emerald-600
            focus:ring-2
            focus:ring-emerald-700/30
            focus:outline-none
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:border-red-600 focus:ring-red-700/30' : ''}
            ${sizeClasses[inputSize]}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
