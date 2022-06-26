import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AppStack } from '../stacks/app-stack';
import { APP_NAME } from '../constants';
import { AppStackConfig } from '../config/stack-config';

interface PipelineAppStageProps extends cdk.StageProps {
  stackConfig: AppStackConfig,
}

export class PipelineAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: PipelineAppStageProps) {
    super(scope, id, props);

    const appStack = new AppStack(this, `${APP_NAME}Stack`, {
      env: {
        account: this.account,
        region: this.region
      },
      stackConfig: props.stackConfig,
    });
  }
}