import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { DEFAULT_STACK_ACCOUNT, PROD_STACK_REGION, STACK_CONFIGS } from '../config/stack-config';
import { APP_NAME, CODE_COMMIT_DEPLOY_BRANCH_NAME, CODE_COMMIT_REPO_NAME } from '../constants';
import { PipelineAppStage } from '../stages/pipeline-app-stage';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import { GlobalPipelineAppStage } from '../stages/global-pipeline-app-stage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Creates a CodeCommit repository that provides the code for the Pipeline deployments (this code)
    const appRepo = new codecommit.Repository(this, CODE_COMMIT_REPO_NAME, {
      repositoryName: CODE_COMMIT_REPO_NAME
    });

    // The basic pipeline declaration. This sets the initial structure
    // of our pipeline
    const pipeline = new CodePipeline(this, `${APP_NAME}Pipeline`, {
      pipelineName: `${APP_NAME}Pipeline`,
      synth: new CodeBuildStep('Synth', {
        input: CodePipelineSource.codeCommit(appRepo, CODE_COMMIT_DEPLOY_BRANCH_NAME),
        installCommands: [
            'npm install -g aws-cdk'
        ],
        commands: [
          // Build Typescript react code
          'cd software/',
          'npm ci', 
          'npm run build',
          // Build Typescript CDK
          'cd ../infrastructure/',
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
        primaryOutputDirectory: 'infrastructure/cdk.out'
      })
    });

    // Global stage
    let globalEnv = new GlobalPipelineAppStage(this, "GlobalEnv", {
      env: {
        account: DEFAULT_STACK_ACCOUNT,
        region: PROD_STACK_REGION
      }
    })
    const globalStage = pipeline.addStage(globalEnv);
    
    // App Stages
    for (let index in STACK_CONFIGS) {
      if (STACK_CONFIGS[index].isAlpha()) {
        // First entry is Alpha stage
        let alphaEnv = new PipelineAppStage(this, "AlphaEnv",
          {
            env: {
              account: STACK_CONFIGS[index].account,
              region: STACK_CONFIGS[index].region
            },
            stackConfig: STACK_CONFIGS[index],
          }
        );
        const alphaStage = pipeline.addStage(alphaEnv);
        alphaStage.addPost(new ManualApprovalStep("AlphaManualApprovalStep", {
          comment: "Alpha Manual Approval Step"
        }));
      } else if (STACK_CONFIGS[index].isBeta()) {
        // Second entry is Beta stage
        let betaEnv = new PipelineAppStage(this, "BetaEnv",
          {
            env: {
              account: STACK_CONFIGS[index].account,
              region: STACK_CONFIGS[index].region
            },
            stackConfig: STACK_CONFIGS[index],
          }
        );
        const betaStage = pipeline.addStage(betaEnv);
        betaStage.addPost(new ManualApprovalStep("BetaManualApprovalStep", {
          comment: "Beta Manual Approval Step"
        }));
      } else if (STACK_CONFIGS[index].isProd()) {
        // All other entries are production
        let prodEnv = new PipelineAppStage(this, ["ProdEnv", STACK_CONFIGS[index].account, STACK_CONFIGS[index].region].join("-"),
         {
           env: {
             account: STACK_CONFIGS[index].account,
             region: STACK_CONFIGS[index].region
           },
           stackConfig: STACK_CONFIGS[index],
         }
        );
        const prodStage = pipeline.addStage(prodEnv);
      } else {
        throw new TypeError("Unsupported stageType");
      }
    }
  }
}
