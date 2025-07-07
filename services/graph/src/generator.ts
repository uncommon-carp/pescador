import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['./src/schema/refSchema.gql'],
  generates: {
    '../../libs/interfaces/graph/types.generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-resolvers'],
      config: {
        skipTypename: true,
        scalars: {
          DateTime: {
            input: 'string',
            output: 'Date',
          },
        },
      },
    },
  },
};

export default config;
