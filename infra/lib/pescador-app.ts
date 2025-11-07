import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthStack } from './auth-stack';
import { UserStack } from './user-stack';
import { GraphStack } from './graph-stack';
import { ConditionsStack } from './conditions-stack';

export interface PescadorAppConfig {
  stage: string;
  account?: string;
  region?: string;
}

export class PescadorApp extends Construct {
  public readonly authStack: AuthStack;
  public readonly userStack: UserStack;
  public readonly graphStack: GraphStack;
  public readonly conditionsStack: ConditionsStack;

  constructor(scope: Construct, id: string, config: PescadorAppConfig) {
    super(scope, id);

    const stackEnv = {
      account: config.account || process.env.CDK_DEFAULT_ACCOUNT,
      region: config.region || process.env.CDK_DEFAULT_REGION,
    };

    // Create the auth stack
    this.authStack = new AuthStack(this, `PescadorAuthStack-${config.stage}`, {
      stage: config.stage,
      env: stackEnv,
      description: `Pescador Auth Service Stack - ${config.stage}`,
      tags: {
        Service: 'auth',
        Stage: config.stage,
        Project: 'Pescador',
      },
    });

    // Create the user stack (depends on auth stack for Cognito IDs and table)
    this.userStack = new UserStack(this, `PescadorUserStack-${config.stage}`, {
      stage: config.stage,
      env: stackEnv,
      userPoolId: this.authStack.userPoolId,
      userPoolClientId: this.authStack.userPoolClientId,
      userProfileTableName: this.authStack.userProfileTableName,
      description: `Pescador User Service Stack - ${config.stage}`,
      tags: {
        Service: 'user',
        Stage: config.stage,
        Project: 'Pescador',
      },
    });

    // UserStack depends on AuthStack for table name
    this.userStack.addDependency(this.authStack);

    // Create the Conditions stack (independent, no dependencies)
    this.conditionsStack = new ConditionsStack(this, `PescadorConditionsStack-${config.stage}`, {
      stage: config.stage,
      env: stackEnv,
      description: `Pescador Conditions Service Stack - ${config.stage}`,
      tags: {
        Service: 'conditions',
        Stage: config.stage,
        Project: 'Pescador',
      },
    });

    // Create the GraphQL stack (depends on Auth, User, and Conditions stacks)
    this.graphStack = new GraphStack(this, `PescadorGraphStack-${config.stage}`, {
      stage: config.stage,
      env: stackEnv,
      userPoolId: this.authStack.userPoolId,
      userPoolClientId: this.authStack.userPoolClientId,
      userProfileTableName: this.authStack.userProfileTableName,
      createProfileFunctionArn: this.userStack.createProfileFn.functionArn,
      updateProfileFunctionArn: this.userStack.updateProfileFn.functionArn,
      getProfileFunctionArn: this.userStack.getProfileFn.functionArn,
      getWeatherByZipFunctionArn: this.conditionsStack.getWeatherByZipFn.functionArn,
      getStationsByBoxFunctionArn: this.conditionsStack.getStationsByBoxFn.functionArn,
      getStationByIdFunctionArn: this.conditionsStack.getStationByIdFn.functionArn,
      description: `Pescador GraphQL Service Stack - ${config.stage}`,
      tags: {
        Service: 'graph',
        Stage: config.stage,
        Project: 'Pescador',
      },
    });

    // GraphStack depends on Auth, User, and Conditions stacks
    this.graphStack.addDependency(this.authStack);
    this.graphStack.addDependency(this.userStack);
    this.graphStack.addDependency(this.conditionsStack);
  }

  // Method to get auth stack outputs for other stacks
  public getAuthStackOutputs() {
    return {
      userPoolId: this.authStack.userPoolId,
      userPoolClientId: this.authStack.userPoolClientId,
      apiEndpoint: this.authStack.apiEndpoint,
    };
  }
}