import { getWeatherByZipResolver } from "./conditions";

export function getResolvers() {
  const resolvers = {
    Query: {
      hello: () => "world",
      weather: getWeatherByZipResolver,
    },
  };
  return resolvers;
}
