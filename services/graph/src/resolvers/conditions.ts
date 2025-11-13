import {
  GetStationByIdFunction,
  GetStationsByBoxFunction,
  GetWeatherByZipFunction,
  BulkStation,
  CurrentWeather,
  GetStationFuzzyFunction,
} from '@pescador/libs';
import { invokeServiceFunction } from '../utils';

export const getWeatherByZipResolver = async (
  _: unknown,
  input: { zip: string },
): Promise<CurrentWeather | null> => {
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

export const getStationFuzzyResolver = async (
  _: unknown,
  input: { userInput: string },
) => {
  const resp = await invokeServiceFunction<GetStationFuzzyFunction>(
    'pescador-conditions',
    'getStationFuzzy',
    input,
  );
  return resp;
};
