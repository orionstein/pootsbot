let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

module.exports = (match, say) => {
  match(['poll', 'createpoll'], (search) => {
    let parse = search.split('?')
    let question = parse[0]
    let options = parse[1].split(',')
    let reqBody = JSON.stringify({
      title: (question + '?'),
      options: options
    })
    console.log(reqBody)
    let req = {
      url: 'https://strawpoll.me/api/v2/polls',
      json: true,
      method: 'POST',
      body: reqBody,
      headers: {
        'content-type': 'application/json'
      }
    }
    request(req, (error, res, body) => {
      if (!error) {
        console.log('wentok')
        console.log(res)
        console.log(body)
      } else {
        console.log('errar')
        console.log(error)
      }
    })
  })
}
