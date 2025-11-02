import { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'pescador-profiles',
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
              'dynamodb:UpdateItem',
              'dynamodb:Query',
              'dynamodb:Scan',
            ],
            Resource:
              'arn:aws:dynamodb:us-east-1:*:table/pescador-user-profiles*',
          },
        ],
      },
    },
    environment: {
      DYNAMODB_TABLE: 'pescador-user-profiles-dev',
      PESCADOR_COGNITO_USER_POOL_ID: '${ssm:/pescador/cognito/user-pool-id}',
      PESCADOR_COGNITO_APP_ID: '${ssm:/pescador/cognito/app-client-id}',
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
      UserProfilesTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'UserProfiles',
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'userSub',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'userSub',
              KeyType: 'HASH',
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
    createUserProfile: {
      handler: 'src/profiles.createUserProfile',
    },
    updateUserProfile: {
      handler: 'src/profiles.updateUserProfile',
    },
    getUserProfile: {
      handler: 'src/profiles.getUserProfile',
    },
  },
};

module.exports = serverlessConfiguration;