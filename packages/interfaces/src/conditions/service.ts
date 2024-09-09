import { BulkStation, CurrentWeather } from "@pescador/graph";

export interface GetWeatherByZipFunction {
  serviceName: "service-conditions";
  functionName: "getWeatherByZip";
  input: { zip: string };
  output: CurrentWeather;
}

export interface GetStationsByBoxFunction {
  serviceName: "service-conditions";
  functionName: "getStationsByBox";
  input: { zip: string };
  output: BulkStation;
}

export interface GetStationsById {
  serviceName: "service-conditions";
  functionName: "getStationsById";
  input: { ids: string[] };
  output: BulkStation;
}
