import { GetWeatherByZipFunction } from "@pescador/interfaces";
import { invokeServiceFunction } from "../utils";

export const getWeatherByZipResolver = (_, input: { zip: string }) => {
  const { zip } = input;
  const resp = invokeServiceFunction<GetWeatherByZipFunction>(
    "service-conditions",
    "getWeatherByZip",
    { zip },
  );
  return resp;
};
