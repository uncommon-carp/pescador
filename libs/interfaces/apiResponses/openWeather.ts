export interface OpenWeatherResponse {
  lat: number;
  lon: number;
  current?: ResponseCurrentWeather;
  minutely?: [MinutelyWeather];
  hourly?: [ResponseCurrentWeather];
}

export interface ResponseCurrentWeather {
  sunrise: number;
  sunset: number;
  temp: number;
  pressure: number;
  humidity: number;
  clouds: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: [WeatherDescription];
}

export interface WeatherDescription {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MinutelyWeather {
  dt: number;
  precipitation: number;
}
