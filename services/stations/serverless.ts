import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'pescador-stations',
  frameworkVersion: '4',

  provider: {
    name: 'aws',
    profile: 'corys',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:DeleteItem',
              'dynamodb:Query',
              'dynamodb:Scan',
            ],
            Resource: 'arn:aws:dynamodb:us-east-1:*:table/pescador-user-stations*',
          },
        ],
      },
    },
    environment: {
      DYNAMODB_TABLE: 'pescador-user-stations-${self:provider.stage}',
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

  resources: {
    Resources: {
      UserStationsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'pescador-user-stations-${self:provider.stage}',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'userSub',
              AttributeType: 'S',
            },
            {
              AttributeName: 'stationId',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'userSub',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'stationId',
              KeyType: 'RANGE',
            },
          ],
          TimeToLiveSpecification: {
            AttributeName: 'ttl',
            Enabled: false,
          },
        },
      },
    },
  },

  functions: {
    addFavoriteStation: {
      handler: 'src/stations.addFavoriteStation',
    },
    removeFavoriteStation: {
      handler: 'src/stations.removeFavoriteStation',
    },
    getFavoriteStations: {
      handler: 'src/stations.getFavoriteStations',
    },
  },
};

module.exports = serverlessConfiguration;