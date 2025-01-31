import { BulkStation, CurrentWeather } from '../graph';

export interface GetWeatherByZipFunction {
  serviceName: 'service-conditions';
  functionName: 'getWeatherByZip';
  input: { zip: string };
  output: CurrentWeather;
}

export interface GetStationsByBoxFunction {
  serviceName: 'service-conditions';
  functionName: 'getStationsByBox';
  input: { zip: string };
  output: BulkStation;
}

export interface GetStationByIdFunction {
  serviceName: 'service-conditions';
  functionName: 'getStationById';
  input: { id: string; range: number };
  output: BulkStation;
}
