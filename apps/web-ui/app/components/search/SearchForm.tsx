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
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchValue,
  onSearchChange,
  onSubmit,
  loading = false,
  placeholder = 'Enter location (address, city, zip, county)',
  className = '',
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className={`mt-8 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center animate-slide-up ${className}`}
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
  );
};
