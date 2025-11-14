import { Card } from '../ui/Card';

interface LocationOption {
  display: string;
  lat: number;
  lng: number;
  city?: string;
  county?: string;
  state?: string;
}

interface LocationOptionsCardProps {
  locations: LocationOption[];
  onLocationSelect: (location: LocationOption) => void;
  className?: string;
}

export const LocationOptionsCard: React.FC<LocationOptionsCardProps> = ({
  locations,
  onLocationSelect,
  className = '',
}) => {
  if (!locations || locations.length === 0) return null;

  return (
    <Card className={`animate-fade-in ${className}`}>
      <h2 className="text-xl font-bold text-stone-100 mb-4 text-center">
        Did you mean one of these locations?
      </h2>
      <div className="space-y-2">
        {locations.map((location, index) => (
          <button
            key={index}
            onClick={() => onLocationSelect(location)}
            className="w-full text-left px-4 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-stone-100 transition-colors duration-200 border border-emerald-700/30 hover:border-emerald-600"
          >
            <span className="font-medium">{location.display}</span>
          </button>
        ))}
      </div>
    </Card>
  );
};
