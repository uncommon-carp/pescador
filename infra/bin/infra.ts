#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PescadorApp } from '../lib/pescador-app';

const app = new cdk.App();

// Get configuration from CDK context or environment variables
const stage = app.node.tryGetContext('stage') || process.env.STAGE || 'dev';
const account = app.node.tryGetContext('account') || process.env.CDK_DEFAULT_ACCOUNT;
const region = app.node.tryGetContext('region') || process.env.CDK_DEFAULT_REGION || 'us-east-1';

// Create the Pescador application with all services
const pescadorApp = new PescadorApp(app, 'Pescador', {
  stage,
  account,
  region,
});

// Add app-level tags
cdk.Tags.of(app).add('Project', 'Pescador');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
