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
  console.log('pingg!')
  console.log(event.headers)
  console.log(event.body)

  gateway.getApiKeysAsync({
    nameQuery: 'POOTSBOTKEY',
    includeValues: true
  })
    .then((data) => {
      console.log('gatekey?')
      console.log(data)
      let key = data.items[0]
      if (event.body.ref === 'refs/heads/master') {
        if (crypto) {
          let hash = crypto.createHmac('sha1', key.value).update(JSON.stringify(event.body)).digest('hex')
          let strHash = 'sha1=' + hash
          if (strHash === event.headers['X-Hub-Signature']) {
            return {
              projectName: 'pootsbot'
            }
          } else {
            throw new Error('Invalid Key')
          }
        } else {
          if (event.body.repository['full_name'] === 'orionstein/pootsbot') {
            return {
              projectName: 'pootsbot'
            }
          } else {
            throw new Error('Invalid Key')
          }
        }
      } else {
        throw new Error('Only Build on Master')
      }
    }
  )
    .then(codebuild.startBuildAsync)
    .then((data) => {
      console.log('parallel, yo!')
      console.log(data)
      let newItem = data
      console.log(newItem)
      let funcData = {
        FunctionName: 'pootsbot-api-dev-pollBuild',
        InvocationType: 'Event',
        Payload: JSON.stringify(newItem)
      }
      return funcData
    }
  )
    .then(lambda.invokePromise)
    .then((data) => {
      let funcData = {
        FunctionName: 'pootsbot-api-dev-stopBuilds',
        InvocationType: 'Event',
        Payload: JSON.stringify(newItem)
      }
      return funcData
    })
    .then(lambda.invokePromise)
    .then(() => {
      context.succeed(true);
    })
};
