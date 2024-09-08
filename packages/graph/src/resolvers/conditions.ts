import { GetWeatherByZipFunction } from "@pescador/interfaces";
import { invokeServiceFunction } from "../utils";
import { CurrentWeather } from "../types";

export const getWeatherByZipResolver = async (
  _,
  input: { zip: string },
): Promise<CurrentWeather> => {
  const { zip } = input;
  const resp = await invokeServiceFunction<GetWeatherByZipFunction>(
    "service-conditions",
    "getWeatherByZip",
    { zip },
  );
  return resp;
};
