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

const myPlugin = {
  async requestDidStart(requestContext) {
    console.log('=== Apollo Plugin - Request Started ===');
    console.log('Request operation:', requestContext.request.operationName);
    console.log('Request headers:', JSON.stringify(requestContext.request.http?.headers, null, 2));
    console.log('Context authorization:', requestContext.contextValue?.authorization);
  }
};

const server = new ApolloServer<GraphQLContext>({
  schema,
  introspection: true,
  plugins: [myPlugin]
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler({
    context: async ({ event }) => {
      // Handle both lowercase and capitalized authorization headers
      // API Gateway v2 normalizes headers to lowercase, so check both
      const authHeader = event.headers?.Authorization || event.headers?.authorization;

      // Debug logging
      console.log('GraphQL Handler - All headers:', JSON.stringify(event.headers, null, 2));
      console.log('GraphQL Handler - Authorization header value:', authHeader || 'NOT PRESENT');
      console.log('GraphQL Handler - Event keys:', Object.keys(event));

      return {
        authorization: authHeader,
      };
    },
  }),
);
