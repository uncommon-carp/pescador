import { CurrentWeather } from "@pescador/graph";

export interface GetWeatherByZipFunction {
  serviceName: "service-conditions";
  functionName: "getWeatherByZip";
  input: { zip: string };
  output: CurrentWeather;
}
