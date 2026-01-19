import { OpenWeatherResponse, CurrentWeather } from '@pescador/libs';
import axios from 'axios';
import { getClouds, getWindDirection, getLocationCoords, parseLambdaEvent } from '../utils';

interface GetWeatherInput {
  zip: string;
}

export async function getWeatherByZip(
  event: any,
): Promise<CurrentWeather | null> {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;
  const input = parseLambdaEvent<GetWeatherInput>(event, 'zip');
  const { zip } = input;
  const result = await getLocationCoords(zip);

  // If multiple locations found, return null - user needs to select one first
  if (result.type !== 'loc') {
    return null;
  }

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
      sunrise: response.data.current.sunrise,
      sunset: response.data.current.sunset,
      condition: {
        main: response.data.current.weather[0].main,
        description: response.data.current.weather[0].description,
        icon: response.data.current.weather[0].icon,
      },
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
