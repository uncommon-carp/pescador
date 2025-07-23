import {
  AddFavoriteStationFunction,
  RemoveFavoriteStationFunction,
  GetFavoriteStationsFunction,
  ServiceAddFavoriteStationInput,
  ServiceRemoveFavoriteStationInput,
  GetFavoriteStationsInput,
  ServiceStationOperationResult,
  GetFavoriteStationsResult,
  AddFavoriteStationInput,
  RemoveFavoriteStationInput,
  StationOperationResult,
} from '@pescador/libs';
import { invokeServiceFunction } from '../utils';

export const addFavoriteStationResolver = async (
  _: unknown,
  { input }: { input: AddFavoriteStationInput },
): Promise<StationOperationResult> => {
  // Convert GraphQL input to service input
  const serviceInput: ServiceAddFavoriteStationInput = {
    userSub: input.userSub,
    stationId: input.stationId,
    stationName: input.stationName,
    lat: input.lat ?? null,
    lon: input.lon ?? null,
  };

  const serviceResp = await invokeServiceFunction<AddFavoriteStationFunction>(
    'pescador-stations',
    'addFavoriteStation',
    serviceInput,
  );

  // Convert service response to GraphQL response
  return {
    success: serviceResp.success,
    message: serviceResp.message ?? null,
  };
};

export const removeFavoriteStationResolver = async (
  _: unknown,
  { input }: { input: RemoveFavoriteStationInput },
): Promise<StationOperationResult> => {
  // Convert GraphQL input to service input
  const serviceInput: ServiceRemoveFavoriteStationInput = {
    userSub: input.userSub,
    stationId: input.stationId,
  };

  const serviceResp = await invokeServiceFunction<RemoveFavoriteStationFunction>(
    'pescador-stations',
    'removeFavoriteStation',
    serviceInput,
  );

  // Convert service response to GraphQL response
  return {
    success: serviceResp.success,
    message: serviceResp.message ?? null,
  };
};

export const getFavoriteStationsResolver = async (
  _: unknown,
  { userSub }: { userSub: string },
) => {
  const input: GetFavoriteStationsInput = { userSub };
  const serviceResp = await invokeServiceFunction<GetFavoriteStationsFunction>(
    'pescador-stations',
    'getFavoriteStations',
    input,
  );

  // Convert service response to GraphQL response
  return serviceResp.stations.map(station => ({
    stationId: station.stationId,
    stationName: station.stationName,
    lat: station.lat ?? null,
    lon: station.lon ?? null,
    dateAdded: station.dateAdded,
  }));
};