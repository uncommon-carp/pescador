import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

interface ConditionsStackProps extends cdk.StackProps {
  stage: string;
}

export class ConditionsStack extends cdk.Stack {
  public readonly getWeatherByZipFn: lambda.NodejsFunction;
  public readonly getStationsByBoxFn: lambda.NodejsFunction;
  public readonly getStationByIdFn: lambda.NodejsFunction;
  public readonly getStationFuzzyFn: lambda.NodejsFunction;

  constructor(scope: Construct, id: string, props: ConditionsStackProps) {
    super(scope, id, props);

    // 1. Common configuration
    const monorepoRoot = path.join(__dirname, '..', '..');

    const lambdaEnv = {
      OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY || '',
      MAPQUEST_API_KEY: process.env.MAPQUEST_API_KEY || '',
    };

    const commonBundlingOptions = {
      minify: true,
      sourceMap: false,
      target: 'node18',
      externalModules: ['aws-sdk'],
      nodeModules: ['axios'],
      forceDockerBundling: false,
    };

    // 2. Create getWeatherByZip Lambda function
    const weatherFunctionName = `${cdk.Stack.of(this).stackName}-GetWeatherByZip`;
    const weatherLogGroup = new logs.LogGroup(this, 'WeatherLogGroup', {
      logGroupName: `/aws/lambda/${weatherFunctionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.getWeatherByZipFn = new lambda.NodejsFunction(this, 'GetWeatherByZip', {
      runtime: Runtime.NODEJS_18_X,
      projectRoot: monorepoRoot,
      depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
      entry: path.join(monorepoRoot, 'services/conditions/src/weather/weather.ts'),
      handler: 'getWeatherByZip',
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      functionName: weatherFunctionName,
      logGroup: weatherLogGroup,
      bundling: commonBundlingOptions,
    });

    // 3. Create getStationsByBox Lambda function
    const stationsByBoxFunctionName = `${cdk.Stack.of(this).stackName}-GetStationsByBox`;
    const stationsByBoxLogGroup = new logs.LogGroup(this, 'StationsByBoxLogGroup', {
      logGroupName: `/aws/lambda/${stationsByBoxFunctionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.getStationsByBoxFn = new lambda.NodejsFunction(this, 'GetStationsByBox', {
      runtime: Runtime.NODEJS_18_X,
      projectRoot: monorepoRoot,
      depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
      entry: path.join(monorepoRoot, 'services/conditions/src/water/water.ts'),
      handler: 'getStationsByBox',
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      functionName: stationsByBoxFunctionName,
      logGroup: stationsByBoxLogGroup,
      bundling: commonBundlingOptions,
    });

    // 4. Create getStationById Lambda function
    const stationByIdFunctionName = `${cdk.Stack.of(this).stackName}-GetStationById`;
    const stationByIdLogGroup = new logs.LogGroup(this, 'StationByIdLogGroup', {
      logGroupName: `/aws/lambda/${stationByIdFunctionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.getStationByIdFn = new lambda.NodejsFunction(this, 'GetStationById', {
      runtime: Runtime.NODEJS_18_X,
      projectRoot: monorepoRoot,
      depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
      entry: path.join(monorepoRoot, 'services/conditions/src/water/water.ts'),
      handler: 'getStationById',
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      functionName: stationByIdFunctionName,
      logGroup: stationByIdLogGroup,
      bundling: commonBundlingOptions,
    });

    // 5. Create getStationFuzzy Lambda function
    const stationFuzzyFunctionName = `${cdk.Stack.of(this).stackName}-GetStationFuzzy`;
    const stationFuzzyLogGroup = new logs.LogGroup(this, 'StationFuzzyLogGroup', {
      logGroupName: `/aws/lambda/${stationFuzzyFunctionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.getStationFuzzyFn = new lambda.NodejsFunction(this, 'GetStationFuzzy', {
      runtime: Runtime.NODEJS_18_X,
      projectRoot: monorepoRoot,
      depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
      entry: path.join(monorepoRoot, 'services/conditions/src/water/water.ts'),
      handler: 'getStationFuzzy',
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      functionName: stationFuzzyFunctionName,
      logGroup: stationFuzzyLogGroup,
      bundling: commonBundlingOptions,
    });

    // 6. Outputs
    new cdk.CfnOutput(this, 'GetWeatherByZipFunctionName', {
      value: this.getWeatherByZipFn.functionName,
      description: 'Get Weather By Zip Lambda function name',
      exportName: `PescadorConditions-WeatherFunctionName-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetWeatherByZipFunctionArn', {
      value: this.getWeatherByZipFn.functionArn,
      description: 'Get Weather By Zip Lambda function ARN',
      exportName: `PescadorConditions-WeatherFunctionArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetStationsByBoxFunctionName', {
      value: this.getStationsByBoxFn.functionName,
      description: 'Get Stations By Box Lambda function name',
      exportName: `PescadorConditions-StationsByBoxFunctionName-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetStationsByBoxFunctionArn', {
      value: this.getStationsByBoxFn.functionArn,
      description: 'Get Stations By Box Lambda function ARN',
      exportName: `PescadorConditions-StationsByBoxFunctionArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetStationByIdFunctionName', {
      value: this.getStationByIdFn.functionName,
      description: 'Get Station By Id Lambda function name',
      exportName: `PescadorConditions-StationByIdFunctionName-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetStationByIdFunctionArn', {
      value: this.getStationByIdFn.functionArn,
      description: 'Get Station By Id Lambda function ARN',
      exportName: `PescadorConditions-StationByIdFunctionArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetStationFuzzyFunctionName', {
      value: this.getStationFuzzyFn.functionName,
      description: 'Get Station Fuzzy Lambda function name',
      exportName: `PescadorConditions-StationFuzzyFunctionName-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetStationFuzzyFunctionArn', {
      value: this.getStationFuzzyFn.functionArn,
      description: 'Get Station Fuzzy Lambda function ARN',
      exportName: `PescadorConditions-StationFuzzyFunctionArn-${props.stage}`,
    });
  }
}
