import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "service-conditions",
  frameworkVersion: "3",
  provider: {
    name: "aws",
    runtime: "nodejs18.x",
    region: "us-east-1",
    stage: "dev",
    environment: {
      OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY,
      MAPQUEST_API_KEY: process.env.MAPQUEST_API_KEY,
    },
  },

  functions: {
    getWeatherByZip: {
      handler: "src/weather.getWeatherByZip",
    },
    getStationsByBox: {
      handler: "src/water.getStationsByBox",
    },
    getStationById: {
      handler: "src/water.getStationById",
    },
  },

  package: {
    individually: true,
    exclude: ["node_modules/aws-sdk/**"],
  },

  plugins: ["serverless-webpack"],

  custom: {
    webpack: {
      webpackConfig: "../../../webpack.sls.ts",
      includeModules: true,
    },
  },
};

module.exports = serverlessConfiguration;
