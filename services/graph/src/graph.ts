import { ApolloServer } from '@apollo/server';
import {
  startServerAndCreateLambdaHandler,
  handlers,
} from '@as-integrations/aws-lambda';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { getResolvers } from './resolvers';

import { typeDefs } from './schema/schema.generated';
import { validateJWT } from '@pescador/libs';

const resolvers = getResolvers();

const schema = makeExecutableSchema({ typeDefs, resolvers });

interface GraphQLContext {
  authorization?: string;
  lambdaContext?: unknown
}

const myPlugin = {
  async requestDidStart(requestContext) {
    console.log('=== Apollo Plugin - Request Started ===');
    console.log('Request:', requestContext.request);
    console.log('Request operation:', requestContext.request.operationName);
    // Convert HeaderMap to object for logging
    const headers = requestContext.request.http?.headers;
    const headersObj = headers ? Object.fromEntries(headers) : {};
    console.log('Request headers:', JSON.stringify(headersObj, null, 2));
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
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async ({ event, context }) => {
      console.log('=== Context Function ===');
      console.log('Event headers:', JSON.stringify(event.headers, null, 2));

      // API Gateway v2 normalizes headers to lowercase
      const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
      console.log('Auth header found:', authHeader ? 'YES' : 'NO');

      const authorization = authHeader.replace('Bearer ', '');

      return {
        authorization,
        lambdaContext: context,
      } satisfies GraphQLContext;
    },
  }
);
