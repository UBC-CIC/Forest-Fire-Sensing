import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class FireDetectionModelStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const fireDetectionFunc = new lambda.DockerImageFunction(this, "fireDetectionModel", {
      code: lambda.DockerImageCode.fromImageAsset("./image"),
      memorySize: 512,
      timeout: cdk.Duration.seconds(10)
    })
  }
}
