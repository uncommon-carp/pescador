import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'pescador-auth',

  frameworkVersion: '4',

  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-east-1',
    httpApi: {
      cors: true,
    },
    environment: {
      PESCADOR_COGNITO_USER_POOL_ID: { Ref: 'PescadorUserPool' },
      PESCADOR_COGNITO_APP_ID: { Ref: 'PescadorUserPoolClient' },
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: 'events:PutEvents',
            Resource: `arn:aws:events:us-east-1:${process.env.AWS_ACCOUNT_ID}:event-bus/default`,
          },
          {
            Effect: 'Allow',
            Action: ['cognito-idp:*'],
            Resource: { 'Fn::GetAtt': ['PescadorUserPool', 'Arn'] },
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

  resources: {
    Resources: {
      // The Cognito User Pool Definition
      PescadorUserPool: {
        Type: 'AWS::Cognito::UserPool',
        Properties: {
          UserPoolName: 'pescador-user-pool-${sls:stage}',
          Schema: [
            { Name: 'name', AttributeDataType: 'String', Mutable: true },
            {
              Name: 'email',
              AttributeDataType: 'String',
              Mutable: true,
              Required: true,
            },
          ],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireSymbols: false,
              RequireUppercase: true,
            },
          },
          // Allow users to sign in using their email address
          UsernameAttributes: ['email'],
          // Automatically verify user emails
          AutoVerifiedAttributes: ['email'],
          // Configure the postConfirmation Lambda trigger
          LambdaConfig: {
            PostConfirmation: {
              'Fn::GetAtt': ['PostConfirmationLambdaFunction', 'Arn'],
            },
          },
        },
      },

      // The Cognito User Pool Client (your app)
      PescadorUserPoolClient: {
        Type: 'AWS::Cognito::UserPoolClient',
        Properties: {
          ClientName: 'pescador-web-ui-${sls:stage}',
          UserPoolId: { Ref: 'PescadorUserPool' },
          // The auth flows your client will use
          ExplicitAuthFlows: [
            'ALLOW_USER_PASSWORD_AUTH',
            'ALLOW_REFRESH_TOKEN_AUTH',
          ],
          // Set to false for public clients like a web UI
          GenerateSecret: false,
        },
      },
    },
    // Export the IDs of the created resources for easy access
    Outputs: {
      UserPoolId: {
        Value: { Ref: 'PescadorUserPool' },
      },
      UserPoolClientId: {
        Value: { Ref: 'PescadorUserPoolClient' },
      },
    },
  },
};

module.exports = serverlessConfiguration;
