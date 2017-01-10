let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

function pootsQuote(bot, config) {
  let commentArr = []

  let requestFunc = _.curry(function(page, callback) {
    request('https://www.kickstarter.com/profile/poots/comments?page=' + page, function(error, res, body) {
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
  for (var i = 0; i < 6; i++) {
    requestArr.push(requestFunc(i))
  }

  async.parallel(requestArr, function(err, results) {
    bot.say(config.channels[0], _.sample(commentArr));
  })
}

module.exports = pootsQuote
