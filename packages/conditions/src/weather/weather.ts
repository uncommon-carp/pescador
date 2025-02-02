import { OpenWeatherResponse, CurrentWeather } from '@pescador/interfaces';
import axios from 'axios';
import { getClouds, getWindDirection, getZipCoords } from '../utils';

interface GetWeatherInput {
  zip: string;
}

export async function getWeatherByZip(
  input: GetWeatherInput,
): Promise<CurrentWeather> {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;

  const { zip } = input;
  const result = await getZipCoords(zip);
  const { lat, lng } = result;
  const params = {
    lat,
    lon: lng,
    appid: apiKey,
    units: 'imperial',
  };
  try {
    const response = await axios<OpenWeatherResponse>({
      method: 'get',
      url: 'https://api.openweathermap.org/data/3.0/onecall',
      params,
    });
    if (!response.data.current) throw new Error('Weather request failed');

    const clouds = getClouds(response.data.current.clouds);
    const direction = getWindDirection(response.data.current.wind_deg);

    const weatherData: CurrentWeather = {
      temp: response.data.current.temp,
      wind: {
        speed: response.data.current.wind_speed,
        direction,
        gust: response.data.current.wind_gust,
      },
      pressure: response.data.current.pressure,
      humidity: response.data.current.humidity,
      clouds,
    };
    return weatherData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unexpected error');
    }
  }
}
