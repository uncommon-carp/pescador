import { FormEvent } from 'react';
import { TextInput } from '../ui/TextInput';
import { Button } from '../ui/Button';

interface SearchFormProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchValue,
  onSearchChange,
  onSubmit,
  loading = false,
  placeholder = 'Enter location (address, city, zip, county)',
  className = '',
  radius = 10,
  onRadiusChange,
}) => {
  const radiusOptions = [5, 10, 25, 50];

  return (
    <div className={`mt-8 w-full ${className}`}>
      <form
        onSubmit={onSubmit}
        className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up"
      >
        <div className="relative w-full sm:w-80">
          <TextInput
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            inputSize="lg"
            aria-label="Location Search Input"
          />
        </div>
        <Button type="submit" loading={loading} size="lg" className="w-full sm:w-auto">
          Search
        </Button>
      </form>

      {onRadiusChange && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <label className="text-sm text-stone-200 font-medium">
            Search Radius
          </label>
          <div className="flex gap-2 rounded-lg bg-slate-800/60 p-1 border border-emerald-700/40">
            {radiusOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onRadiusChange(option)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  radius === option
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'text-stone-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {option} mi
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
