export interface ServiceFavoriteStation {
  stationId: string;
  stationName: string;
  lat?: number | null;
  lon?: number | null;
  dateAdded: string;
}

export interface ServiceAddFavoriteStationInput {
  userSub: string;
  stationId: string;
  stationName: string;
  lat?: number | null;
  lon?: number | null;
  idToken: string;
}

export interface ServiceRemoveFavoriteStationInput {
  userSub: string;
  stationId: string;
  idToken: string;
}

export interface GetFavoriteStationsInput {
  userSub: string;
  idToken: string;
}

export interface ServiceStationOperationResult {
  success: boolean;
  message?: string;
}

export interface GetFavoriteStationsResult {
  stations: ServiceFavoriteStation[];
}

export interface AddFavoriteStationFunction {
  serviceName: 'pescador-stations';
  functionName: 'addFavoriteStation';
  input: ServiceAddFavoriteStationInput;
  output: ServiceStationOperationResult;
}

export interface RemoveFavoriteStationFunction {
  serviceName: 'pescador-stations';
  functionName: 'removeFavoriteStation';
  input: ServiceRemoveFavoriteStationInput;
  output: ServiceStationOperationResult;
}

export interface GetFavoriteStationsFunction {
  serviceName: 'pescador-stations';
  functionName: 'getFavoriteStations';
  input: GetFavoriteStationsInput;
  output: GetFavoriteStationsResult;
}

export interface GetFavoriteStationsOrderedInput {
  userSub: string;
  idToken: string;
  preferredOrder?: string[];
  limit?: number;
}

export interface GetFavoriteStationsOrderedResult {
  stations: ServiceFavoriteStation[];
  totalCount: number;
}

export interface GetFavoriteStationsOrderedFunction {
  serviceName: 'pescador-stations';
  functionName: 'getFavoriteStationsOrdered';
  input: GetFavoriteStationsOrderedInput;
  output: GetFavoriteStationsOrderedResult;
}