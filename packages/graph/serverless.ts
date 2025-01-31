import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'graph',
  frameworkVersion: '3',

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    httpApi: {
      cors: true,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: 'Lambda:InvokeFunction',
            Resource: `arn:aws:lambda:us-east-1:${process.env.AWS_ACCOUNT_ID}:function:*`,
          },
        ],
      },
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
    graph: {
      handler: 'src/graph.graphqlHandler',
      events: [
        {
          httpApi: {
            path: '/',
            method: 'POST',
          },
        },
        {
          httpApi: {
            path: '/',
            method: 'GET',
          },
        },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
