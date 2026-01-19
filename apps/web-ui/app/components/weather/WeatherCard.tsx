import { Card } from '../ui/Card';
import { convertMmHgToInHg } from '@/lib/mmhgToInHg';
import {
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightAltCloudy,
  WiCloudy,
  WiRain,
  WiDayRain,
  WiNightAltRain,
  WiThunderstorm,
  WiSnow,
  WiFog,
  WiSunrise,
  WiSunset,
  WiStrongWind,
  WiBarometer,
  WiHumidity,
  WiCloud,
} from 'react-icons/wi';
import { IconType } from 'react-icons';

interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
}

interface WindData {
  speed?: number;
  direction?: string;
  gust?: number;
}

interface WeatherData {
  temp: number;
  wind?: WindData;
  pressure: number;
  humidity: number;
  clouds: string;
  sunrise: number;
  sunset: number;
  condition: WeatherCondition;
}

interface WeatherCardProps {
  weather: WeatherData;
  title?: string;
  className?: string;
}

const getWeatherIcon = (iconCode: string): IconType => {
  const iconMap: Record<string, IconType> = {
    '01d': WiDaySunny,
    '01n': WiNightClear,
    '02d': WiDayCloudy,
    '02n': WiNightAltCloudy,
    '03d': WiCloudy,
    '03n': WiCloudy,
    '04d': WiCloudy,
    '04n': WiCloudy,
    '09d': WiRain,
    '09n': WiRain,
    '10d': WiDayRain,
    '10n': WiNightAltRain,
    '11d': WiThunderstorm,
    '11n': WiThunderstorm,
    '13d': WiSnow,
    '13n': WiSnow,
    '50d': WiFog,
    '50n': WiFog,
  };
  return iconMap[iconCode] || WiDaySunny;
};

const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  title = 'Current Weather',
  className = '',
}) => {
  const WeatherIcon = getWeatherIcon(weather.condition.icon);
  const capitalizedDescription = weather.condition.description
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <Card className={`${className}`}>
      <h2 className="text-2xl font-bold text-stone-100 mb-4 text-center">{title}</h2>

      {/* Header: Icon + Temp + Description */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <WeatherIcon className="text-amber-400 w-20 h-20" />
        <div className="text-center">
          <p className="text-5xl font-bold text-amber-400">
            {Math.round(weather.temp)}°F
          </p>
          <p className="text-lg text-stone-300 mt-1">{capitalizedDescription}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-emerald-700/40 pt-4">
        {/* Wind */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-stone-400 mb-1">
            <WiStrongWind className="w-5 h-5" />
            <span className="text-sm">Wind</span>
          </div>
          <p className="text-xl font-semibold text-stone-200">
            {weather.wind?.speed ?? 'N/A'} mph
          </p>
          <p className="text-sm text-stone-400">{weather.wind?.direction ?? ''}</p>
          {weather.wind?.gust && (
            <p className="text-xs text-stone-500">Gusts: {weather.wind.gust} mph</p>
          )}
        </div>

        {/* Humidity */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-stone-400 mb-1">
            <WiHumidity className="w-5 h-5" />
            <span className="text-sm">Humidity</span>
          </div>
          <p className="text-xl font-semibold text-stone-200">{weather.humidity}%</p>
        </div>

        {/* Pressure */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-stone-400 mb-1">
            <WiBarometer className="w-5 h-5" />
            <span className="text-sm">Pressure</span>
          </div>
          <p className="text-xl font-semibold text-stone-200">
            {convertMmHgToInHg(weather.pressure)} inHg
          </p>
        </div>

        {/* Clouds */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-stone-400 mb-1">
            <WiCloud className="w-5 h-5" />
            <span className="text-sm">Clouds</span>
          </div>
          <p className="text-xl font-semibold text-stone-200">{weather.clouds}</p>
        </div>
      </div>

      {/* Footer: Sunrise/Sunset */}
      <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-emerald-700/40">
        <div className="flex items-center gap-2">
          <WiSunrise className="w-8 h-8 text-amber-400" />
          <div>
            <p className="text-xs text-stone-400">Sunrise</p>
            <p className="text-sm font-semibold text-stone-200">
              {formatTime(weather.sunrise)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WiSunset className="w-8 h-8 text-orange-400" />
          <div>
            <p className="text-xs text-stone-400">Sunset</p>
            <p className="text-sm font-semibold text-stone-200">
              {formatTime(weather.sunset)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
