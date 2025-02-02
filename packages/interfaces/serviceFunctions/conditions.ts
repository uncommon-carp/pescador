import { BulkStation, CurrentWeather } from '../graph';

export interface GetWeatherByZipFunction {
  serviceName: 'pescador-conditions';
  functionName: 'getWeatherByZip';
  input: { zip: string };
  output: CurrentWeather;
}

export interface GetStationsByBoxFunction {
  serviceName: 'pescador-conditions';
  functionName: 'getStationsByBox';
  input: { zip: string };
  output: BulkStation;
}

export interface GetStationByIdFunction {
  serviceName: 'pescador-conditions';
  functionName: 'getStationById';
  input: { id: string; range: number };
  output: BulkStation;
}
