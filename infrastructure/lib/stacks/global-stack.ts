import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';

interface GlobalStackProps extends cdk.StageProps {
}

export class GlobalStack extends Stack {
  cloudfrontDistributionId: string;
  cloudfrontDomainName: string;

  constructor(scope: Construct, id: string, props: GlobalStackProps) {
    super(scope, id, props);
    
    // Create the hosted zone for the root domain here if you want, i created manually via the 
    //  AWS console and import it in the app stacks
  }
}
