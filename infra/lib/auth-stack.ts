import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { BundlingOptions } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

interface AuthStackProps extends cdk.StackProps {
  stage: string;
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userProfileTable: dynamodb.Table;
  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    // 1. Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'PescadorUserPool', {
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

    // 2. DynamoDB Table for User Profiles
    this.userProfileTable = new dynamodb.Table(this, 'UserProfileTable', {
      tableName: `pescador-user-profiles-${props.stage}`,
      partitionKey: {
        name: 'userSub',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: props.stage === 'prod',
    });

    // Add GSI for email lookups
    this.userProfileTable.addGlobalSecondaryIndex({
      indexName: 'email-index',
      partitionKey: {
        name: 'email',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // 3. Create the User Pool App Client
    const userPoolClient = this.userPool.addClient('PescadorAppClient', {
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
      PESCADOR_COGNITO_USER_POOL_ID: this.userPool.userPoolId,
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
      commandHooks: {
        beforeBundling: () => ['npm install esbuild'],
        afterBundling: () => [],
        beforeInstall: () => [],
      },
    };

    const createLambda = (id: string, handler: string) => {
      // Create a unique log group for each Lambda function
      const functionName = `${cdk.Stack.of(this).stackName}-${id}`;
      const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${functionName}`,
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // Clean up on stack deletion
      });

      const fn = new lambda.NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        projectRoot: monorepoRoot,
        depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
        entry: lambdaSourcePath,
        handler,
        environment: lambdaEnv,
        bundling: bundlingOptions,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        functionName: functionName,
        logGroup: logGroup,
      });

      return fn;
    };

    const signUpFn = createLambda('SignUpHandler', 'handleSignUp');
    const confirmSignUpFn = createLambda(
      'ConfirmSignUpHandler',
      'handleConfirmSignUp',
    );
    const signInFn = createLambda('SignInHandler', 'handleSignIn');
    const signOutFn = createLambda('SignOutHandler', 'handleSignOut');

    // 4. Create Post-Confirmation Lambda
    const postConfirmationSourcePath = path.join(
      monorepoRoot,
      'services/auth/src/post-confirmation.ts',
    );

    const postConfFunctionName = `${cdk.Stack.of(this).stackName}-PostConfirmation`;
    const postConfLogGroup = new logs.LogGroup(this, 'PostConfirmationLogGroup', {
      logGroupName: `/aws/lambda/${postConfFunctionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const postConfirmationFn = new lambda.NodejsFunction(this, 'PostConfirmation', {
      runtime: Runtime.NODEJS_18_X,
      projectRoot: monorepoRoot,
      depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
      entry: postConfirmationSourcePath,
      handler: 'handler',
      environment: {
        USER_PROFILE_TABLE_NAME: this.userProfileTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
      functionName: postConfFunctionName,
      logGroup: postConfLogGroup,
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'node18',
        externalModules: ['aws-sdk'],
        nodeModules: [
          '@aws-sdk/client-dynamodb',
          '@aws-sdk/util-dynamodb',
        ],
        forceDockerBundling: false,
      },
    });

    // Grant permissions to write to DynamoDB
    this.userProfileTable.grantWriteData(postConfirmationFn);

    // 5. Grant permissions
    this.userPool.grant(signUpFn, 'cognito-idp:SignUp');
    this.userPool.grant(confirmSignUpFn, 'cognito-idp:ConfirmSignUp');
    this.userPool.grant(signInFn, 'cognito-idp:InitiateAuth');
    this.userPool.grant(signOutFn, 'cognito-idp:GlobalSignOut');

    // 6. Add post-confirmation trigger
    this.userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION,
      postConfirmationFn,
    );

    // 7. API Gateway
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
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `PescadorAuth-UserPoolId-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `PescadorAuth-UserPoolClientId-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'UserProfileTableName', {
      value: this.userProfileTable.tableName,
      description: 'Name of the User Profile DynamoDB table',
      exportName: `PescadorAuth-UserProfileTableName-${props.stage}`,
    });

    // Store outputs as class properties for potential cross-stack references
    this.userPoolId = this.userPool.userPoolId;
    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.apiEndpoint = httpApi.url!;
    this.userProfileTableName = this.userProfileTable.tableName;
  }

  // Public readonly properties for cross-stack access
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  public readonly apiEndpoint: string;
  public readonly userProfileTableName: string;
}
