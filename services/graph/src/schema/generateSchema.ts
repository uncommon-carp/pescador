import { makeExecutableSchema } from '@graphql-tools/schema';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getResolvers } from '../resolvers';
import { printSchema } from 'graphql';

const schemaTemplate = readFileSync(join(__dirname, './schemaTemplate.ts'), {
  encoding: 'utf8',
});
const typeDefs = readFileSync(join(__dirname, './refSchema.gql'), {
  encoding: 'utf8',
});

const resolvers = getResolvers();
const schema = makeExecutableSchema({ typeDefs, resolvers });

writeFileSync(
  join(__dirname, './schema.generated.ts'),
  schemaTemplate.replace('SCHEMA_SDL', printSchema(schema)),
);
