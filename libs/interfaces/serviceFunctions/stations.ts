export interface FavoriteStation {
  stationId: string;
  stationName: string;
  lat?: number | null;
  lon?: number | null;
  dateAdded: string;
}

export interface AddFavoriteStationInput {
  userSub: string;
  stationId: string;
  stationName: string;
  lat?: number | null;
  lon?: number | null;
}

export interface RemoveFavoriteStationInput {
  userSub: string;
  stationId: string;
}

export interface GetFavoriteStationsInput {
  userSub: string;
}

export interface StationOperationResult {
  success: boolean;
  message?: string;
}

export interface GetFavoriteStationsResult {
  stations: FavoriteStation[];
}

export interface AddFavoriteStationFunction {
  serviceName: 'pescador-stations';
  functionName: 'addFavoriteStation';
  input: AddFavoriteStationInput;
  output: StationOperationResult;
}

export interface RemoveFavoriteStationFunction {
  serviceName: 'pescador-stations';
  functionName: 'removeFavoriteStation';
  input: RemoveFavoriteStationInput;
  output: StationOperationResult;
}

export interface GetFavoriteStationsFunction {
  serviceName: 'pescador-stations';
  functionName: 'getFavoriteStations';
  input: GetFavoriteStationsInput;
  output: GetFavoriteStationsResult;
}