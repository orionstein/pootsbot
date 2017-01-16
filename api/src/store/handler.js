'use strict';

const aws = require('aws-sdk');
const _ = require('lodash');
const msgpack = require('msgpack');
const bluebird = require('bluebird');
const uuid = require('node-uuid')
const db = require('../shared/dynamoHelper');

const pootsbotStoreTable = process.env.POOTSBOT_STORE_TABLE || 'pootsbot-store'

module.exports.get = (event, context, callback) => {
  let params = {
    TableName: pootsbotStoreTable,
    IndexName: 'status-index',
    KeyConditionExpression: "#status = :ok",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":ok": {
        "S": "OK"
      }
    },
    ScanIndexForward: false
  };
  return db.queryAsync(params).then(function(data) {
    let buildResult = {};
    let items = _.map(data.Items, function(item) {
      item = {
        data: msgpack.unpack(item.data.B),
        date: parseInt(item.entryDate.N),
        name: item.name.S,
        id: item.id.S
      };
      return item;
    });
    buildResult.items = items;
    context.succeed(buildResult);
  })
    .catch(function(err) {
      context.fail(JSON.stringify({
        errorMessage: err.message
      }));
    });

};

module.exports.set = (event, context, callback) => {
  console.log(event.body)
  if (event.body.name && event.body.data) {
    var compressed = msgpack.pack(event.body.data);
    var params = {
      TableName: pootsbotStoreTable,
      "Item": {
        "id": {
          "S": uuid.v1()
        },
        "name": {
          "S": event.body.name
        },
        "entryDate": {
          "N": Date.now().toString()
        },
        "data": {
          "B": compressed
        },
        "status": {
          "S": "OK"
        }
      }
    };
    return db.putItemAsync(params).then(function(data) {
      context.succeed(true);
    }).catch(function(err, msg) {
      return context.fail(JSON.stringify({
        errorMessage: err.message
      }));
    });
  } else {
    return context.fail(JSON.stringify({
      errorMessage: 'MissingData'
    }));
  }
};
