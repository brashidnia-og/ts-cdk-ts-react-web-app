#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineStack } from '../lib/stacks/pipeline-stack';
import { PIPELINE_STACK_CONFIG } from '../lib/config/stack-config';
import { APP_NAME } from '../lib/constants';

const app = new cdk.App();
new PipelineStack(app, `${APP_NAME}CdkPipelineStack`, {
  env: {
    account: PIPELINE_STACK_CONFIG.account,
    region: PIPELINE_STACK_CONFIG.region
  }
});
