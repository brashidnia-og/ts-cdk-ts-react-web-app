import * as cdk from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { BASE_WEB_DOMAIN, BASE_WEB_DOMAIN_PUBLIC_HOSTED_ZONE_ID } from '../constants';
import { Stack } from 'aws-cdk-lib';
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { AppStackConfig } from '../config/stack-config';

interface AppStackProps extends cdk.StageProps {
  stackConfig: AppStackConfig,
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    
    //Get The Hosted Zone
    const zone = PublicHostedZone.fromHostedZoneAttributes(this, 'PublicHostedZone', {
      hostedZoneId: BASE_WEB_DOMAIN_PUBLIC_HOSTED_ZONE_ID,
      zoneName: BASE_WEB_DOMAIN
    });

    //Create S3 Bucket for our website
    const siteBucket = new Bucket(this, "SiteBucket", {
      bucketName: props.stackConfig.zoneName,
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    //Create Certificate
    const siteCertificate = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
      domainName: props.stackConfig.zoneName,
      hostedZone: zone,
      region: "us-east-1"  //standard for acm certs
    });

    //Create CloudFront Distribution
    const siteDistribution = new cloudfront.CloudFrontWebDistribution(this, "SiteDistribution", {
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(siteCertificate, {
        aliases: [props.stackConfig.zoneName],
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
        sslMethod: cloudfront.SSLMethod.SNI
      }),
      originConfigs: [{
        customOriginSource: {
          domainName: siteBucket.bucketWebsiteDomainName,
          originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY
        },
        behaviors: [{
          isDefaultBehavior: true
        }]
      }]
    });

    //Create A Record Custom Domain to CloudFront CDN
    new route53.ARecord(this, "SiteRecord", {
      recordName: props.stackConfig.zoneName,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(siteDistribution)),
      zone
    });

    //Deploy site to s3
    new deploy.BucketDeployment(this, "Deployment", {
      sources: [deploy.Source.asset("../software/build")], // Path to built react app
      destinationBucket: siteBucket,
      distribution: siteDistribution,
      distributionPaths: ["/*"]
    });
  }
}
