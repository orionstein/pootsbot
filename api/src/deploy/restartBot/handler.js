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

module.exports.restart = (event, context, callback) => {
  const restartPootsBot = () => {
    let serviceParams = {
      service: 'pootsbot',
      desiredCount: 0
    }
    ecs.updateServiceAsync(serviceParams)
      .then((data) => {
        console.log('stopped!')
        let task = [data.service.deployments[0].id]
        let params = {
          tasks: task
        }
        ecs.waitFor('tasksStopped', params, (err, data) => {
          console.log('really stopped!')
        })
      })
  }
  restartPootsBot()
};
