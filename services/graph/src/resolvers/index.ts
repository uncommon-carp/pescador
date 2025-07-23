import {
  getStationByIdResolver,
  getStationsByBoxResolver,
  getWeatherByZipResolver,
} from './conditions';
import {
  addFavoriteStationResolver,
  removeFavoriteStationResolver,
  getFavoriteStationsResolver,
} from './stations';

export function getResolvers() {
  const resolvers = {
    Query: {
      hello: () => 'world',
      weather: getWeatherByZipResolver,
      bulkStation: getStationsByBoxResolver,
      station: getStationByIdResolver,
      favoriteStations: getFavoriteStationsResolver,
    },
    Mutation: {
      addFavoriteStation: addFavoriteStationResolver,
      removeFavoriteStation: removeFavoriteStationResolver,
    },
  };

  return resolvers;
}
