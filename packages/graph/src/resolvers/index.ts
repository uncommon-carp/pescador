import {
  getStationByIdResolver,
  getStationsByBoxResolver,
  getWeatherByZipResolver,
} from './conditions';

export function getResolvers() {
  const resolvers = {
    Query: {
      hello: () => 'world',
      weather: getWeatherByZipResolver,
      bulkStation: getStationsByBoxResolver,
      station: getStationByIdResolver,
    },
  };

  return resolvers;
}
