let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

const titlesBlacklistRegexes = [
  /Robot Check/,
  /Instagram/,
  /Imgur: The most awesome images on the Internet/,
  /\/TheP\(aste\)\?B\\\.in\/i - For all your pasting needs!/,
  /Update Your Browser \| Facebook/,
  /Snippet /| IRCCloud/
]

function findUrls( text )
{
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    return urlArray;
}



function linkQuery(bot, config, command) {
  let requestFunc = _.curry(function(page, callback) {
    request(page, function(error, res, body) {
      if (!error && res.statusCode === 200) {
        let $ = cheerio.load(body);
        let title = $("title").text().trim();
        if (!_.some(titlesBlacklistRegexes, function(regex) {
          return regex.test(title);
        })) {
          bot.say(config.channels[0], title);
        }
        callback()
      }
    })
  })
  let links = findUrls(command)
  let calls = []
  _.forEach(links, function(link){
    calls.push(requestFunc(link))
  })
  async.parallel(calls, function(err, results) {
    _.noop()
  })
}

module.exports = linkQuery
