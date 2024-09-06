import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "service-conditions", // Service name
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs18.x", // Set the Node.js runtime version
    region: "us-east-1", // Set the AWS region
    stage: "dev",
  },

  functions: {
    getWeatherByZip: {
      handler: "src/service.getWeatherByZip", // Path to your Lambda function handler
      environment: {
        OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY, // Additional environment variable for this Lambda
        MAPQUEST_API_KEY: process.env.MAPQUEST_API_KEY,
      },
    },
  },

  package: {
    individually: true, // Package this function individually to keep the size minimal
    exclude: ["node_modules/aws-sdk/**"], // Exclude AWS SDK (available by default in Lambda)
  },

  plugins: ["serverless-webpack"], // Optional: Use webpack to bundle the Lambda (if using)

  custom: {
    webpack: {
      webpackConfig: "../../../webpack.sls.ts", // If using webpack, provide the config
      includeModules: true, // Include necessary modules when bundling
    },
  },
};

module.exports = serverlessConfiguration;
