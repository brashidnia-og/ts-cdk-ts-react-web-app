import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { APP_NAME } from '../constants';
import { GlobalStack } from '../stacks/global-stack';

interface GlobalPipelineAppStageProps extends cdk.StageProps {
}

export class GlobalPipelineAppStage extends cdk.Stage {
  globalStack: GlobalStack;

  constructor(scope: Construct, id: string, props: GlobalPipelineAppStageProps) {
    super(scope, id, props);

    this.globalStack = new GlobalStack(this, `${APP_NAME}GlobalStack`, {
      env: {
        account: this.account,
        region: this.region
      },
    });
  }
}