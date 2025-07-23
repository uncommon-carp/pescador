import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuthStack } from './auth-stack';

export interface PescadorAppConfig {
  stage: string;
  account?: string;
  region?: string;
}

export class PescadorApp extends Construct {
  public readonly authStack: AuthStack;

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