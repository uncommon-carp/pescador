export function getResolvers() {
  const resolvers = {
    Query: {
      health: () => 'ok',
    },
  };

  return resolvers;
}
