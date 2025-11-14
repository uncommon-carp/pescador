import { Card } from '../ui/Card';
import { convertMmHgToInHg } from '@/lib/mmhgToInHg';

interface WeatherData {
  temp: number;
  wind: {
    speed: string;
    direction: string;
  };
  pressure: string;
  humidity?: number;
}

interface WeatherCardProps {
  weather: WeatherData;
  title?: string;
  showHumidity?: boolean;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  title = 'Current Weather',
  showHumidity = false,
  className = '',
}) => {
  const gridCols = showHumidity
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-3';

  return (
    <Card className={`text-center ${className}`}>
      <h2 className="text-2xl font-bold text-stone-100 mb-4">{title}</h2>
      <div className={`grid ${gridCols} gap-4 items-center justify-center`}>
        <div className="text-center">
          <p className="text-5xl font-bold text-amber-400">
            {Math.round(weather.temp)}°F
          </p>
          <p className={`mt-2 ${showHumidity ? 'text-stone-400' : ''}`}>
            {showHumidity ? 'Temperature' : ''}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className={`font-semibold ${showHumidity ? 'text-3xl text-stone-200' : 'text-lg text-stone-200'}`}>
            {showHumidity ? weather.wind?.speed || 'N/A' : 'Wind'}
          </p>
          <p className={`text-stone-300 ${showHumidity ? 'mt-2 text-stone-400' : ''}`}>
            {showHumidity
              ? `Wind Speed (mph) from ${weather.wind?.direction || 'N/A'}`
              : `${weather.wind.speed} from the ${weather.wind.direction}`}
          </p>
        </div>
        <div className="text-center sm:text-left">
          <p className={`font-semibold ${showHumidity ? 'text-3xl text-stone-200' : 'text-lg text-stone-200'}`}>
            {showHumidity ? convertMmHgToInHg(Number(weather.pressure)) : 'Pressure'}
          </p>
          <p className={`text-stone-300 ${showHumidity ? 'mt-2 text-stone-400' : ''}`}>
            {showHumidity
              ? 'Pressure (inHg)'
              : `${convertMmHgToInHg(Number(weather.pressure))} inHg`}
          </p>
        </div>
        {showHumidity && weather.humidity !== undefined && (
          <div className="text-center">
            <p className="text-3xl font-bold text-stone-200">
              {weather.humidity}%
            </p>
            <p className="text-stone-400 mt-2">Humidity</p>
          </div>
        )}
      </div>
    </Card>
  );
};
