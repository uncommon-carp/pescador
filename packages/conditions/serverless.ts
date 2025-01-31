import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'pescador-conditions',
  frameworkVersion: '4',

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    httpApi: {
      cors: true,
    },
    iam: {
      role: {},
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
      handler: 'src/weather.getWeatherByZip',
    },
    getStationsByBox: {
      handler: 'src/water.getStationsByBox',
    },
    getStationById: {
      handler: 'src/water.getStationById',
    },
  },
};

module.exports = serverlessConfiguration;
