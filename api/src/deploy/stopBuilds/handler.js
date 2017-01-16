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

module.exports.stop = (event, context, callback) => {
  let newestId = event.build.id
  codebuild.listBuildsForProjectAsync({
    projectName: 'pootsbot'
  }).then((data) => {
    let jobs = []
    console.log('gotjobs!')
    if (data.ids.length > 0) {
      _.take(_.pull(data.ids, newestId), 5).map((id) => {
        jobs.push(codebuild.stopBuildAsync({
          id: id
        }))
      })
    }
    bluebird.all(jobs).then((data) => {
      console.log('stoppedjobs!')
    })
  })
};
