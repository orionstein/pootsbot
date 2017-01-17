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

module.exports.poll = (event, context, callback) => {

  const pollBuild = (buildId) => {
    return codebuild.batchGetBuildsAsync({
      ids: [buildId]
    }).then((data) => {
      let build = data.builds[0]
      if (!build.buildComplete) {
        function repoll(id) {
          let funcData = {
            FunctionName: 'pootsbot-api-dev-pollBuild',
            InvocationType: 'Event',
            Payload: JSON.stringify({
              build: {
                id: id
              }
            })
          }
          lambda.invokePromise(funcData).then((data) => {
            context.succeed(true);
          })
        }
        _.delay(repoll, 3000, (buildId))
      } else {
        let funcData = {
          FunctionName: 'pootsbot-api-dev-restartBot',
          InvocationType: 'Event'
        }
        lambda.invokePromise(funcData).then((data) => {
          context.succeed(true);
        })
      }
    })
  }

  if (event.build.id) {
    pollBuild(event.build.id)
  } else {
    context.fail(false);
  }
};
