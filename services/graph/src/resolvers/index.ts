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
      favoriteStations: getFavoriteStationsResolver,
      userProfile: getUserProfileResolver,
    },
    Mutation: {
      addFavoriteStation: addFavoriteStationResolver,
      removeFavoriteStation: removeFavoriteStationResolver,
      createUserProfile: createUserProfileResolver,
      updateUserProfile: updateUserProfileResolver,
    },
  };

  return resolvers;
}
