import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { BundlingOptions } from 'aws-cdk-lib/aws-lambda-nodejs';

interface AuthStackProps extends cdk.StackProps {
  stage: string;
}

export class AuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // 1. Cognito User Pool
    const userPool = new cognito.UserPool(this, 'PescadorUserPool', {
      userPoolName: `pescador-user-pool-${props.stage}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
        requireUppercase: true,
      },
      userVerification: {
        emailSubject: 'Verify your email for Pescador!',
        emailBody: 'Thanks for signing up! Your verification code is {####}.',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    });

    // 2. Create the User Pool App Client FIRST
    const userPoolClient = userPool.addClient('PescadorAppClient', {
      userPoolClientName: `pescador-web-ui-${props.stage}`,
      authFlows: { userPassword: true },
      generateSecret: false,
    });

    // 3. Setup Lambda configuration with all environment variables upfront
    const monorepoRoot = path.join(__dirname, '..', '..');
    const lambdaSourcePath = path.join(
      monorepoRoot,
      'services/auth/src/auth.ts',
    );

    const lambdaEnv = {
      PESCADOR_COGNITO_USER_POOL_ID: userPool.userPoolId,
      PESCADOR_COGNITO_APP_ID: userPoolClient.userPoolClientId,
    };

    // Bundling options to prevent circular dependencies
    const bundlingOptions: BundlingOptions = {
      minify: true,
      sourceMap: false,
      target: 'node18',
      externalModules: [
        'aws-sdk', // Exclude AWS SDK v2 (not needed in Lambda runtime)
      ],
      nodeModules: [
        '@aws-sdk/client-cognito-identity-provider', // Include only what we need
      ],
      forceDockerBundling: false,
    };

    const createLambda = (id: string, handler: string) =>
      new lambda.NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        projectRoot: monorepoRoot,
        depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
        entry: lambdaSourcePath,
        handler,
        environment: lambdaEnv,
        bundling: bundlingOptions,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
      });

    const signUpFn = createLambda('SignUpHandler', 'handleSignUp');
    const confirmSignUpFn = createLambda(
      'ConfirmSignUpHandler',
      'handleConfirmSignUp',
    );
    const signInFn = createLambda('SignInHandler', 'handleSignIn');
    const signOutFn = createLambda('SignOutHandler', 'handleSignOut');
    const postConfirmationFn = createLambda(
      'PostConfirmationHandler',
      'postConfirmation',
    );

    // 4. Grant permissions
    userPool.grant(signUpFn, 'cognito-idp:SignUp');
    userPool.grant(confirmSignUpFn, 'cognito-idp:ConfirmSignUp');
    userPool.grant(signInFn, 'cognito-idp:InitiateAuth');
    userPool.grant(signOutFn, 'cognito-idp:GlobalSignOut');

    // Note: Post-confirmation trigger commented out to avoid circular dependencies
    // If needed, consider setting up separately or using an alternative approach
    // userPool.addTrigger(
    //   cognito.UserPoolOperation.POST_CONFIRMATION,
    //   postConfirmationFn,
    // );

    // 6. API Gateway
    const httpApi = new apigw.HttpApi(this, 'PescadorAuthApi', {
      corsPreflight: {
        allowHeaders: ['Content-Type'],
        allowMethods: [apigw.CorsHttpMethod.POST, apigw.CorsHttpMethod.OPTIONS],
        allowOrigins: ['*'],
      },
    });

    httpApi.addRoutes({
      path: '/sign-up',
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration('SignUpIntegration', signUpFn),
    });
    httpApi.addRoutes({
      path: '/verify',
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        'ConfirmSignUpIntegration',
        confirmSignUpFn,
      ),
    });
    httpApi.addRoutes({
      path: '/sign-in',
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration('SignInIntegration', signInFn),
    });
    httpApi.addRoutes({
      path: '/sign-out',
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration('SignOutIntegration', signOutFn),
    });

    // 7. Stack outputs
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: httpApi.url!,
      description: 'Auth API Gateway endpoint',
      exportName: `PescadorAuth-ApiEndpoint-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `PescadorAuth-UserPoolId-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `PescadorAuth-UserPoolClientId-${props.stage}`,
    });

    // Store outputs as class properties for potential cross-stack references
    this.userPoolId = userPool.userPoolId;
    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.apiEndpoint = httpApi.url!;
  }

  // Public readonly properties for cross-stack access
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  public readonly apiEndpoint: string;
}
