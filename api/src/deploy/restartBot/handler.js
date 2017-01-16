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
    console.log('lets go boys!')
    let serviceParams = {
      service: 'pootsbot',
      desiredCount: 0
    }
    ecs.updateServiceAsync(serviceParams)
      .then((data) => {
        console.log(data)
        let task = [data.service.deployments[0].id]
        let params = {
          tasks: task
        }
        ecs.waitFor('tasksStopped', params, (err, data) => {
          console.log('stopped!')
          console.log(data)
          let newServiceParams = {
            service: 'pootsbot',
            desiredCount: 1
          }
          ecs.updateServiceAsync(newServiceParams)
            .then((data) => {
              console.log('done!')
              context.succeed(true);
            })
        })
      })
  }
  restartPootsBot()
};
