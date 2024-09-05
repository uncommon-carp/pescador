import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: ["./src/schema/refSchema.gql"],
  generates: {
    "./src/types/traits.generated.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-resolvers"],
      config: {
        nonOptionalTypename: true,
        scalars: {
          DateTime: {
            input: "string",
            output: "Date",
          },
        },
      },
    },
  },
};

export default config;
