import {
  GetStationByIdFunction,
  GetStationsByBoxFunction,
  GetWeatherByZipFunction,
  BulkStation,
  CurrentWeather,
} from '@pescador/interfaces';
import { invokeServiceFunction } from '../utils';

export const getWeatherByZipResolver = async (
  _: unknown,
  input: { zip: string },
): Promise<CurrentWeather> => {
  const resp = await invokeServiceFunction<GetWeatherByZipFunction>(
    'service-conditions',
    'getWeatherByZip',
    input,
  );
  return resp;
};

export const getStationsByBoxResolver = async (
  _: unknown,
  input: { zip: string },
): Promise<BulkStation> => {
  const resp = await invokeServiceFunction<GetStationsByBoxFunction>(
    'service-conditions',
    'getStationsByBox',
    input,
  );
  return resp;
};

export const getStationByIdResolver = async (
  _: unknown,
  input: { id: string; range: number },
) => {
  const resp = await invokeServiceFunction<GetStationByIdFunction>(
    'service-conditions',
    'getStationById',
    input,
  );
  return resp;
};
