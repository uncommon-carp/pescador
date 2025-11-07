import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

interface StationsStackProps extends cdk.StackProps {
  stage: string;
  userPoolId: string;
  userPoolClientId: string;
}

export class StationsStack extends cdk.Stack {
  public readonly userStationsTable: dynamodb.Table;
  public readonly addFavoriteStationFn: lambda.NodejsFunction;
  public readonly removeFavoriteStationFn: lambda.NodejsFunction;
  public readonly getFavoriteStationsFn: lambda.NodejsFunction;
  public readonly getFavoriteStationsOrderedFn: lambda.NodejsFunction;

  constructor(scope: Construct, id: string, props: StationsStackProps) {
    super(scope, id, props);

    // 1. Create DynamoDB table for user favorite stations
    this.userStationsTable = new dynamodb.Table(this, 'UserStationsTable', {
      tableName: `pescador-user-stations-${props.stage}`,
      partitionKey: {
        name: 'userSub',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'stationId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev, change for prod
      pointInTimeRecovery: props.stage === 'prod',
    });

    // 2. Common configuration
    const monorepoRoot = path.join(__dirname, '..', '..');
    const stationsSourcePath = path.join(
      monorepoRoot,
      'services/stations/src/stations.ts',
    );

    const lambdaEnv = {
      DYNAMODB_TABLE: this.userStationsTable.tableName,
      PESCADOR_COGNITO_USER_POOL_ID: props.userPoolId,
      PESCADOR_COGNITO_APP_ID: props.userPoolClientId,
    };

    const commonBundlingOptions = {
      minify: true,
      sourceMap: false,
      target: 'node18',
      externalModules: ['aws-sdk'],
      nodeModules: [
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/util-dynamodb',
        'jsonwebtoken',
        'jwks-rsa',
      ],
      forceDockerBundling: false,
    };

    // Helper function to create Lambda functions
    const createLambda = (
      id: string,
      handler: string,
      description: string,
    ): lambda.NodejsFunction => {
      const functionName = `${cdk.Stack.of(this).stackName}-${id}`;
      const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${functionName}`,
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      const fn = new lambda.NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        projectRoot: monorepoRoot,
        depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
        entry: stationsSourcePath,
        handler,
        environment: lambdaEnv,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        functionName: functionName,
        logGroup: logGroup,
        bundling: commonBundlingOptions,
        description,
      });

      // Grant DynamoDB permissions
      this.userStationsTable.grantReadWriteData(fn);

      return fn;
    };

    // 3. Create Lambda functions
    this.addFavoriteStationFn = createLambda(
      'AddFavorite',
      'addFavoriteStation',
      'Add a station to user favorites',
    );

    this.removeFavoriteStationFn = createLambda(
      'RemoveFavorite',
      'removeFavoriteStation',
      'Remove a station from user favorites',
    );

    this.getFavoriteStationsFn = createLambda(
      'GetFavorites',
      'getFavoriteStations',
      'Get all favorite stations for a user',
    );

    this.getFavoriteStationsOrderedFn = createLambda(
      'GetFavoritesOrdered',
      'getFavoriteStationsOrdered',
      'Get favorite stations with custom ordering',
    );

    // 4. Outputs
    new cdk.CfnOutput(this, 'UserStationsTableName', {
      value: this.userStationsTable.tableName,
      description: 'User Stations DynamoDB table name',
      exportName: `PescadorStations-TableName-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'AddFavoriteStationFunctionArn', {
      value: this.addFavoriteStationFn.functionArn,
      description: 'Add Favorite Station Lambda function ARN',
      exportName: `PescadorStations-AddFunctionArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'RemoveFavoriteStationFunctionArn', {
      value: this.removeFavoriteStationFn.functionArn,
      description: 'Remove Favorite Station Lambda function ARN',
      exportName: `PescadorStations-RemoveFunctionArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetFavoriteStationsFunctionArn', {
      value: this.getFavoriteStationsFn.functionArn,
      description: 'Get Favorite Stations Lambda function ARN',
      exportName: `PescadorStations-GetFunctionArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetFavoriteStationsOrderedFunctionArn', {
      value: this.getFavoriteStationsOrderedFn.functionArn,
      description: 'Get Favorite Stations Ordered Lambda function ARN',
      exportName: `PescadorStations-GetOrderedFunctionArn-${props.stage}`,
    });
  }
}
