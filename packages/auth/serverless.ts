import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'auth',
  frameworkVersion: '3',
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    httpApi: {
      cors: true,
    },
    environment: {
      COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: 'events:PutEvents',
            Resource: `arn:aws:events:us-east-1:${process.env.AWS_ACCOUNT_ID}:event-bus/default`,
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
    signIn: {
      handler: 'src/auth.handleSignIn',
      events: [
        {
          httpApi: {
            path: '/sign-in',
            method: 'POST',
          },
        },
      ],
    },
    signOut: {
      handler: 'src/auth.handleSignOut',
      events: [
        {
          httpApi: {
            path: '/sign-out',
            method: 'POST',
          },
        },
      ],
    },
    signUp: {
      handler: 'src/auth.handleSignUp',
      events: [
        {
          httpApi: {
            path: '/sign-up',
            method: 'POST',
          },
        },
      ],
    },
    confirmSignUp: {
      handler: 'src/auth.handleConfirmSignUp',
      events: [
        {
          httpApi: {
            path: '/verify',
            method: 'POST',
          },
        },
      ],
    },
    postConfirmation: {
      handler: 'src/auth.postConfirmation',
    },
  },
};

module.exports = serverlessConfiguration;
