import { ApolloServer } from '@apollo/server';
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { getResolvers } from './resolvers';

import { typeDefs } from './schema/schema.generated';

const resolvers = getResolvers();

const schema = makeExecutableSchema({ typeDefs, resolvers });

interface GraphQLContext {
  authorization?: string;
}

const server = new ApolloServer<GraphQLContext>({
  schema,
  introspection: true,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler({
    context: async ({ event }) => {
      // Handle both lowercase and capitalized authorization headers
      const authHeader = event.headers?.authorization || event.headers?.Authorization;

      // Debug logging
      console.log('Headers received:', JSON.stringify(event.headers, null, 2));
      console.log('Authorization header:', authHeader);

      return {
        authorization: authHeader,
      };
    },
  }),
);
