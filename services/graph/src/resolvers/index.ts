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
// Temporarily disabled due to type issues - will fix after deployment
// import {
//   createUserProfileResolver,
//   updateUserProfileResolver,
//   getUserProfileResolver,
// } from './profiles';

export function getResolvers() {
  const resolvers = {
    Query: {
      hello: () => 'world',
      weather: getWeatherByZipResolver,
      bulkStation: getStationsByBoxResolver,
      station: getStationByIdResolver,
      favoriteStations: getFavoriteStationsResolver,
      // userProfile: getUserProfileResolver, // TODO: Fix type issues
      userProfile: () => null, // Temporary placeholder
    },
    Mutation: {
      addFavoriteStation: addFavoriteStationResolver,
      removeFavoriteStation: removeFavoriteStationResolver,
      // createUserProfile: createUserProfileResolver, // TODO: Fix type issues
      // updateUserProfile: updateUserProfileResolver, // TODO: Fix type issues
      createUserProfile: () => ({ success: false, message: 'Not implemented yet' }),
      updateUserProfile: () => ({ success: false, message: 'Not implemented yet' }),
    },
  };

  return resolvers;
}
