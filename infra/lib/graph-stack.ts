import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';

interface GraphStackProps extends cdk.StackProps {
  stage: string;
  userPoolId: string;
  userPoolClientId: string;
  userProfileTableName: string;
  createProfileFunctionArn: string;
  updateProfileFunctionArn: string;
  getProfileFunctionArn: string;
}

export class GraphStack extends cdk.Stack {
  public readonly graphqlFunction: lambda.NodejsFunction;
  public readonly apiEndpoint: string;

  constructor(scope: Construct, id: string, props: GraphStackProps) {
    super(scope, id, props);

    // 1. Lambda configuration
    const monorepoRoot = path.join(__dirname, '..', '..');
    const graphSourcePath = path.join(
      monorepoRoot,
      'services/graph/src/graph.ts',
    );

    const lambdaEnv = {
      // Cognito configuration for JWT validation
      PESCADOR_COGNITO_USER_POOL_ID: props.userPoolId,
      PESCADOR_COGNITO_APP_ID: props.userPoolClientId,
      
      // DynamoDB table for direct access if needed
      DYNAMODB_TABLE: props.userProfileTableName,
      
      // Profile service Lambda function ARNs for invocation
      CREATE_PROFILE_FUNCTION_ARN: props.createProfileFunctionArn,
      UPDATE_PROFILE_FUNCTION_ARN: props.updateProfileFunctionArn,
      GET_PROFILE_FUNCTION_ARN: props.getProfileFunctionArn,
      
      // Service names for Lambda invocation
      PROFILE_SERVICE_NAME: 'pescador-profiles',
    };

    // 2. Create GraphQL Lambda function
    const functionName = `${cdk.Stack.of(this).stackName}-GraphQL`;
    const logGroup = new logs.LogGroup(this, 'GraphQLLogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.graphqlFunction = new lambda.NodejsFunction(this, 'GraphQLFunction', {
      runtime: Runtime.NODEJS_18_X,
      projectRoot: monorepoRoot,
      depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
      entry: graphSourcePath,
      handler: 'graphqlHandler',
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024, // GraphQL can be memory-intensive
      functionName: functionName,
      logGroup: logGroup,
      bundling: {
        minify: true,
        sourceMap: false,
        target: 'node18',
        externalModules: ['aws-sdk'],
        nodeModules: [
          '@apollo/server',
          '@as-integrations/aws-lambda',
          '@graphql-tools/schema',
          'graphql',
          '@aws-sdk/client-lambda',
          '@aws-sdk/client-dynamodb',
          '@aws-sdk/util-dynamodb',
          'jsonwebtoken',
          'jwks-client',
        ],
        forceDockerBundling: false,
        commandHooks: {
          beforeBundling: (inputDir: string, outputDir: string) => [
            'npm install esbuild',
            // Run GraphQL codegen and schema generation
            'cd services/graph && npm run build:codegen',
          ],
          afterBundling: () => [],
          beforeInstall: () => [],
        },
      },
    });

    // 3. Grant permissions to invoke profile service functions
    const profileFunctionArns = [
      props.createProfileFunctionArn,
      props.updateProfileFunctionArn,
      props.getProfileFunctionArn,
    ];

    profileFunctionArns.forEach(arn => {
      this.graphqlFunction.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ['lambda:InvokeFunction'],
        resources: [arn],
      }));
    });

    // 4. Grant DynamoDB permissions (for direct access if needed)
    const tableArn = `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:table/${props.userProfileTableName}`;
    const gsiArn = `${tableArn}/index/email-index`;
    
    this.graphqlFunction.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
      effect: cdk.aws_iam.Effect.ALLOW,
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem',
        'dynamodb:DeleteItem',
        'dynamodb:Query',
        'dynamodb:Scan',
      ],
      resources: [tableArn, gsiArn],
    }));

    // 5. API Gateway for GraphQL endpoint
    const httpApi = new apigw.HttpApi(this, 'GraphQLApi', {
      apiName: `pescador-graphql-${props.stage}`,
      description: `Pescador GraphQL API - ${props.stage}`,
      corsPreflight: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [apigw.CorsHttpMethod.POST, apigw.CorsHttpMethod.OPTIONS],
        allowOrigins: ['*'], // Configure appropriately for production
      },
    });

    // GraphQL endpoint (typically POST to root path)
    httpApi.addRoutes({
      path: '/',
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration('GraphQLIntegration', this.graphqlFunction),
    });

    // GraphQL introspection endpoint (for GraphQL Playground/tools)
    httpApi.addRoutes({
      path: '/graphql',
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration('GraphQLPlaygroundIntegration', this.graphqlFunction),
    });

    // 6. Outputs
    this.apiEndpoint = httpApi.url!;

    new cdk.CfnOutput(this, 'GraphQLApiEndpoint', {
      value: this.apiEndpoint,
      description: 'GraphQL API endpoint',
      exportName: `PescadorGraph-ApiEndpoint-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GraphQLFunctionName', {
      value: this.graphqlFunction.functionName,
      description: 'GraphQL Lambda function name',
      exportName: `PescadorGraph-FunctionName-${props.stage}`,
    });
  }
}