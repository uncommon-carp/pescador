import {
  AddFavoriteStationFunction,
  RemoveFavoriteStationFunction,
  GetFavoriteStationsFunction,
  AddFavoriteStationInput,
  RemoveFavoriteStationInput,
  GetFavoriteStationsInput,
  StationOperationResult,
  GetFavoriteStationsResult,
} from '@pescador/libs';
import { invokeServiceFunction } from '../utils';

export const addFavoriteStationResolver = async (
  _: unknown,
  { input }: { input: AddFavoriteStationInput },
): Promise<StationOperationResult> => {
  const resp = await invokeServiceFunction<AddFavoriteStationFunction>(
    'pescador-stations',
    'addFavoriteStation',
    input,
  );
  return resp;
};

export const removeFavoriteStationResolver = async (
  _: unknown,
  { input }: { input: RemoveFavoriteStationInput },
): Promise<StationOperationResult> => {
  const resp = await invokeServiceFunction<RemoveFavoriteStationFunction>(
    'pescador-stations',
    'removeFavoriteStation',
    input,
  );
  return resp;
};

export const getFavoriteStationsResolver = async (
  _: unknown,
  { userSub }: { userSub: string },
): Promise<GetFavoriteStationsResult['stations']> => {
  const input: GetFavoriteStationsInput = { userSub };
  const resp = await invokeServiceFunction<GetFavoriteStationsFunction>(
    'pescador-stations',
    'getFavoriteStations',
    input,
  );
  return resp.stations;
};