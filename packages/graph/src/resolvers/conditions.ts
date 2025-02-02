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
    'pescador-conditions',
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
    'pescador-conditions',
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
    'pescador-conditions',
    'getStationById',
    input,
  );
  return resp;
};
