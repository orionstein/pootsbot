'use strict';

const aws = require('aws-sdk');
const db = require('../../shared/dynamoHelper');
const _ = require('lodash');
const bluebird = require('bluebird');
const uuid = require('node-uuid')
const async = require('async')
var crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}

var codebuild = bluebird.promisifyAll((new aws.CodeBuild(
  {
    region: "us-east-1",
  })));

var lambda = bluebird.promisifyAll((new aws.Lambda(
  {
    region: "us-east-1",
  })), {
  suffix: 'Promise'
});

var ecs = bluebird.promisifyAll(new aws.ECS(
  {
    region: "us-east-1",
  }));

var gateway = bluebird.promisifyAll(new aws.APIGateway(
  {
    region: "us-east-1",
  }));

module.exports.build = (event, context, callback) => {
  const doBuild = () => {
    codebuild.startBuildAsync({
      projectName: 'pootsbot'
    })
      .then((data) => {
        let newItem = data
        let funcData = {
          FunctionName: 'pootsbot-api-dev-pollBuild',
          InvocationType: 'Event',
          Payload: JSON.stringify(newItem)
        }
        lambda.invokePromise(funcData)
          .then((data) => {
            let funcData = {
              FunctionName: 'pootsbot-api-dev-stopBuilds',
              InvocationType: 'Event',
              Payload: JSON.stringify(newItem)
            }
            lambda.invokePromise(funcData)
              .then((data) => {
                context.succeed(true);
              })
          })
      }
    )
  }

  gateway.getApiKeysAsync({
    nameQuery: 'POOTSBOTKEY',
    includeValues: true
  })
    .then((data) => {
      let key = data.items[0]
      console.log(event.body)
      if (event.body.ref === 'refs/heads/master') {
        if (crypto) {
          let hash = crypto.createHmac('sha1', key.value).update(JSON.stringify(event.body)).digest('hex')
          let strHash = 'sha1=' + hash
          if (strHash === event.headers['X-Hub-Signature']) {
            doBuild()
          } else {
            throw new Error('Invalid Key')
          }
        } else {
          throw new Error('No Crypto!!!')
        }
      } else {
        throw new Error('Only Build on Master')
      }
    }
  )
};
