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

var ecs = bluebird.promisifyAll(new aws.ECS(
  {
    region: "us-east-1",
  }));

module.exports.start = (event, context, callback) => {
  const startPootsBot = () => {
    let serviceParams = {
      service: 'pootsbot',
      desiredCount: 1
    }
    ecs.updateServiceAsync(serviceParams)
      .then((data) => {
        console.log('started!')
        let task = [data.service.deployments[0].id]
        let params = {
          tasks: task
        }
        ecs.waitFor('tasksRunning', params, (err, data) => {
          console.log('really started!')
        })
      })
  }


  if (event && _.includes(event.detail.taskDefinitionArn, 'pootsbot') && (event.detail.desiredStatus === 'STOPPED') && (!!event.detail.stoppedAt)) {
    startPootsBot()
  }

// startPootsBot()
};
