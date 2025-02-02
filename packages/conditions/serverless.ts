import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'pescador-conditions',
  frameworkVersion: '4',

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    iam: {
      role: {},
    },
    environment: {
      OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY,
      MAPQUEST_API_KEY: process.env.MAPQUEST_API_KEY,
    },
  },

  custom: {
    memory: {
      prd: 1536,
      other: 1024, // default lambda memorySize
    },
    prune: {
      automatic: true,
      number: 5,
    },
  },

  functions: {
    getWeatherByZip: {
      handler: 'src/weather/weather.getWeatherByZip',
    },
    getStationsByBox: {
      handler: 'src/water/water.getStationsByBox',
    },
    getStationById: {
      handler: 'src/water/water.getStationById',
    },
  },
};

module.exports = serverlessConfiguration;
