let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let quotes = require('../pootsquotes.json')


module.exports = function(match, say) {

  match(['poots', 'pootsquote'], function() {
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
      if (_.size(commentArr) > 0) {
        say(_.sample(commentArr));
      } else {
        say(_.sample(quotes.quotes));
      }
    })

  })
}
