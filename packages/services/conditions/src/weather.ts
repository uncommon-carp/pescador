import { OpenWeatherResponse } from "@pescador/interfaces";
import axios from "axios";
import { getZipCoords } from "./utils";
import { CurrentWeather } from "@pescador/graph";

interface GetWeatherInput {
  zip: string;
}

export async function getWeatherByZip(
  input: GetWeatherInput,
): Promise<CurrentWeather> {
  const apiKey = process.env.OPEN_WEATHER_API_KEY;

  const { zip } = input;
  const result = await getZipCoords(zip);
  if (typeof result === "string") {
    return result;
  }
  const { lat, lng } = result;
  const params = {
    lat,
    lon: lng,
    appid: apiKey,
    units: "imperial",
  };
  try {
    const response = await axios<OpenWeatherResponse>({
      method: "get",
      url: `https://api.openweathermap.org/data/3.0/onecall`,
      params,
    });
    const weatherData: CurrentWeather = {
      __typename: "CurrentWeather",
      temp: response.data.current.temp,
      wind: {
        __typename: "WindData",
        speed: response.data.current.wind_speed,
        direction: response.data.current.wind_deg,
        gust: response.data.current.wind_gust,
      },
      pressure: response.data.current.pressure,
      humidity: response.data.current.humidity,
      clouds: "mostly cloudy",
    };
    return weatherData;
  } catch (error) {
    if (error.isAxiosError) {
      console.log("Axios error", error);
    } else {
      console.log("Unexpected error", error.message);
    }
  }
}
