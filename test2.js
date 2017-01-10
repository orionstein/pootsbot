let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

function pootsQuote(bot, config) {
  let commentArr = []

  let requestFunc = _.curry(function(page, callback) {
    request('http://www.kickstarter.com/profile/poots/comments?page=' + page, function(error, res, body) {
      if (!error) {
        let $ = cheerio.load(body);
        $('.activity-comment-project').find('.body').each(function(i, elem) {
          commentArr.push($(this).text())
        })
        callback()
      }
    })
  })

  let requestArr = []
  for (var i = 0; i < 20; i++) {
    requestArr.push(requestFunc(i))
  }

  async.parallel(requestArr, function(err, results) {
    let aaa = {
      quotes: commentArr
    }
    console.log(JSON.stringify(aaa))
  })
}

pootsQuote()
