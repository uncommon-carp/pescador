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

const server = new ApolloServer<GraphQLContext>({
  schema,
  introspection: true,
});

export const graphqlHandler = startServerAndCreateLambdaHandler(
  server,
  handlers.createAPIGatewayProxyEventV2RequestHandler(),
  {
    context: async ({ event, context }) => {
      // API Gateway v2 normalizes headers to lowercase
      const authHeader = event.headers?.authorization || event.headers?.Authorization || '';
      const authorization = authHeader.replace('Bearer ', '');

      return {
        authorization,
        lambdaContext: context,
      } satisfies GraphQLContext;
    },
  }
);
