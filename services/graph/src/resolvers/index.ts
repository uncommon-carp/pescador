import {
  getStationByIdResolver,
  getStationFuzzyResolver,
  getStationsByBoxResolver,
  getWeatherByZipResolver,
} from './conditions';
import {
  addFavoriteStationResolver,
  removeFavoriteStationResolver,
  getFavoriteStationsResolver,
} from './stations';
import {
  createUserProfileResolver,
  updateUserProfileResolver,
  getUserProfileResolver,
} from './profiles';

export function getResolvers() {
  const resolvers = {
    Query: {
      hello: () => 'world',
      weather: getWeatherByZipResolver,
      bulkStation: getStationsByBoxResolver,
      station: getStationByIdResolver,
      fuzzySearch: getStationFuzzyResolver,
      favoriteStations: getFavoriteStationsResolver,
      userProfile: getUserProfileResolver,
    },
    Mutation: {
      addFavoriteStation: addFavoriteStationResolver,
      removeFavoriteStation: removeFavoriteStationResolver,
      createUserProfile: createUserProfileResolver,
      updateUserProfile: updateUserProfileResolver,
    },
    FuzzySearchResult: {
      __resolveType(obj: any) {
        // BulkStation has streams and lakes fields
        if ('streams' in obj || 'lakes' in obj) {
          return 'BulkStation';
        }
        // MultiLocationResponse has type and options fields
        if ('type' in obj && 'options' in obj) {
          return 'MultiLocationResponse';
        }
        return null;
      },
    },
  };

  return resolvers;
}
