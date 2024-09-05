import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "graph",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs16.x",
    region: "us-east-1",
    httpApi: {
      cors: true,
    },
  },
  custom: {
    webpack: {
      webpackConfig: "../../webpack.sls.ts",
    },
    memory: {
      prd: 1536,
      other: 1024, // default lambda memorySize
    },
    prune: {
      automatic: true,
      number: 5,
    },
  },
  plugins: ["serverless-webpack"],
  functions: {
    graph: {
      handler: "src/graph.graphqlHandler",
      events: [
        {
          httpApi: {
            path: "/",
            method: "POST",
          },
        },
        {
          httpApi: {
            path: "/",
            method: "GET",
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
