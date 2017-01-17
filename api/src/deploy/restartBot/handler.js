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
        let task = [data.service.deployments[0].id]
        let params = {
          tasks: task
        }
        ecs.waitFor('tasksStopped', params, (err, data) => {
          function doRestart() {
            let newServiceParams = {
              service: 'pootsbot',
              desiredCount: 1
            }
            ecs.updateServiceAsync(newServiceParams)
              .then((data) => {
                let task = [data.service.deployments[0].id]
                let params = {
                  tasks: task
                }
                ecs.waitFor('tasksRunning', params, (err, data) => {
                  context.succeed(true);
                })
              })
          }
          _.delay(doRestart, 3000, {})
        })
      })
  }
  restartPootsBot()
};
