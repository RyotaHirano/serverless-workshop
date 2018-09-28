'use strict';

class ServerlessXRay {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    this.xRayConfig = {
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": "*"
    }

    this.commands = {
      //
    };

    this.hooks = {
      'after:package:compileFunctions': this.Trace.bind(this)
    };
  }

  Trace() {
    const custom = this.serverless.service.custom;

    if (custom.trace !== true) {
      return;
    } else {
      this.serverless.service.getAllFunctions().forEach((functionName) => {
        const functionLogicalId = this.provider.naming.getLambdaLogicalId(functionName);
        this.serverless.service.provider.compiledCloudFormationTemplate
          .Resources[functionLogicalId].Properties.TracingConfig = {
          'Mode': 'Active'
        };
      });
      this.serverless.service.provider.compiledCloudFormationTemplate.Resources
        .IamRoleLambdaExecution.Properties.Policies[0].PolicyDocument.Statement.push(this.xRayConfig);
    }
  }
}

module.exports = ServerlessXRay;
