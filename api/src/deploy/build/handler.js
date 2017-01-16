'use strict';

const aws = require('aws-sdk');
const db = require('../../shared/dynamoHelper');
const _ = require('lodash');
const bluebird = require('bluebird');
const uuid = require('node-uuid')
const async = require('async')

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
  gateway.getApiKeyAsync({
    apiKey: 'POOTSBOTKEY',
    includeValue: true
  })
    .then((data) => {
      console.log('gatekey?')
      console.log(data)
      if (data.value === event.headers['X-Hub-Signature']) {
        if (event.body.ref === 'refs/heads/master')
        {
          return {
            projectName: 'pootsbot'
          }
        }
        else
        {
          throw new Error('Only Build on Master')
        }
      } else {
        throw new Error('Invalid Key')
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
