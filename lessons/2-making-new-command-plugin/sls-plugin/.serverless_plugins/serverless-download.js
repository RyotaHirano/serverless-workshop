'use strict';

class ServerlessDownload {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
    this.region = this.provider.getRegion();
    this.stage = this.provider.getStage();

    this.commands = {
      'download': {
        usage: 'Download DynamoDB Serverless plugin',
        lifecycleEvents: [
          'downloadData'
        ],
        options: {
          resource: {
            usage: 'Specify name of resource for your table',
            required: true
          },
          'target-stage': {
            usage: 'Stage you want to upload data to',
            required: true
          }
        }
      }
    };

    this.hooks = {
      'download:downloadData': this.downloadData.bind(this)
    };
  }

  downloadData() {
    const tableName = this.serverless.service.resources.Resources[this.options.resource].Properties.TableName;

    return this.provider.request('DynamoDB',
      'scan',
      { TableName: tableName },
      this.options.stage,
      this.options.region
    ).then(result => {
      const items = result.Items;
      items.map(item => {
        this.serverless.cli.log(`e-mail: ${item.EmailAddress.S}`);
        this.serverless.cli.log(`name: ${item.Name.S}`);
      });
    })
  }
}

module.exports = ServerlessDownload;
