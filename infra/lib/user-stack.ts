import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

interface UserStackProps extends cdk.StackProps {
  stage: string;
  userPoolId: string;
  userPoolClientId: string;
  userProfileTableName: string;
}

export class UserStack extends cdk.Stack {
  public readonly createProfileFn: lambda.NodejsFunction;
  public readonly updateProfileFn: lambda.NodejsFunction;
  public readonly getProfileFn: lambda.NodejsFunction;

  constructor(scope: Construct, id: string, props: UserStackProps) {
    super(scope, id, props);

    // 1. Lambda configuration
    const monorepoRoot = path.join(__dirname, '..', '..');
    const profilesSourcePath = path.join(
      monorepoRoot,
      'services/profiles/src/profiles.ts',
    );

    const lambdaEnv = {
      DYNAMODB_TABLE: props.userProfileTableName,
      PESCADOR_COGNITO_USER_POOL_ID: props.userPoolId,
      PESCADOR_COGNITO_APP_ID: props.userPoolClientId,
    };

    // Helper function to create profile lambdas
    const createProfileLambda = (id: string, handler: string) => {
      const functionName = `${cdk.Stack.of(this).stackName}-${id}`;
      
      // Create explicit log group
      const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
        logGroupName: `/aws/lambda/${functionName}`,
        retention: logs.RetentionDays.ONE_WEEK,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

      const fn = new lambda.NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        projectRoot: monorepoRoot,
        depsLockFilePath: path.join(monorepoRoot, 'package-lock.json'),
        entry: profilesSourcePath,
        handler,
        environment: lambdaEnv,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        functionName: functionName,
        logGroup: logGroup,
        bundling: {
          minify: true,
          sourceMap: false,
          target: 'node18',
          externalModules: ['aws-sdk'],
          nodeModules: [
            '@aws-sdk/client-dynamodb',
            '@aws-sdk/util-dynamodb',
            'jsonwebtoken',
            'jwks-client',
          ],
          forceDockerBundling: false,
        },
      });

      return fn;
    };

    // 3. Create Lambda functions
    this.createProfileFn = createProfileLambda('CreateProfile', 'createUserProfile');
    this.updateProfileFn = createProfileLambda('UpdateProfile', 'updateUserProfile');
    this.getProfileFn = createProfileLambda('GetProfile', 'getUserProfile');

    // 4. Grant DynamoDB permissions to Lambda functions
    const tableArn = `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:table/${props.userProfileTableName}`;
    const gsiArn = `${tableArn}/index/email-index`;
    
    [this.createProfileFn, this.updateProfileFn, this.getProfileFn].forEach(fn => {
      fn.addToRolePolicy(new cdk.aws_iam.PolicyStatement({
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
    });

    // 5. Export Lambda function ARNs for GraphQL service
    new cdk.CfnOutput(this, 'CreateProfileFunctionArn', {
      value: this.createProfileFn.functionArn,
      description: 'ARN of the Create Profile Lambda function',
      exportName: `PescadorUser-CreateProfileArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'UpdateProfileFunctionArn', {
      value: this.updateProfileFn.functionArn,
      description: 'ARN of the Update Profile Lambda function',
      exportName: `PescadorUser-UpdateProfileArn-${props.stage}`,
    });

    new cdk.CfnOutput(this, 'GetProfileFunctionArn', {
      value: this.getProfileFn.functionArn,
      description: 'ARN of the Get Profile Lambda function',
      exportName: `PescadorUser-GetProfileArn-${props.stage}`,
    });

  }
}