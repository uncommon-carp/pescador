export function getResolvers() {
  const resolvers = {
    Query: {
      hello: () => "world",
    },
  };
  return resolvers;
}
