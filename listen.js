let _ = require('lodash')
let requireGlob = require('require-glob')
// let getLatestUpdate = require('./plugins/latestUpdate')
// let pootsQuote = require('./plugins/pootsQuote')
// let glossaryPlugin = require('./plugins/glossary')
// let wolfram = require('./plugins/wolfram')
let linkQuery = require('./utils/linkQuery')
// let minisPlugin = require('./plugins/kd_miniatures')

let prefix = process.env.POOTSBOT_PREFIX || '!'

const matchText = _.curry(function(text, match) {
  match = match.toLowerCase()
  return _.startsWith(text, (prefix + match));
})

const Match = function(text) {
  let _this = this;
  _this.text = text.toLowerCase();
  return function(match, cb) {
    let mt = matchText(_this.text)
    let matchBool = false
    if (typeof match === 'string') {
      matchBool = mt(match)
    } else {
      matchBool = _.some(match, mt)
    }
    if (!matchBool) {
      return false
    } else {
      if (cb) {
        let search = text.substr(text.indexOf(' ') + 1)
        return cb(search, text)
      }
      else
        return matchBool
    }
  }
}

const Say = function(bot, config, from, to) {
  let _this = this
  _this.bot = bot
  _this.nick = bot.nick
  _this.channelConf = config.channels[0]
  _this.from = from
  _this.to = to
  return function(message, overrideRecipient) {
    let recipient = _this.to === _this.nick ? _this.from : _this.to
    if (overrideRecipient === 'channel') {
      recipient = _this.channelConf
    } else if (overrideRecipient === 'user') {
      recipient = _this.from
    }
    return bot.say(recipient, message)
  }
}

function listen(bot, config, from, to, text, message) {
  let match = new Match(text)
  let say = new Say(bot, config, from, to)
  requireGlob(['./plugins/*.js', '!linkQuery.js']).then(function (modules){
    //load and run each module in plugins, except for few
    _.forEach(modules, function(module){
      module(match, say)
    })

    //any hard matches can be here
    match('version', function() {
      say('Current Commands - ', 'user');
      say('PootsBot version: ' + process.env.POOTSBOT_VERSION);
    })
    match(['commands', 'help'], function() {
      say('Current Commands - ', 'user');
      say('!PootsQuote, !latestUpdate, !glossary, !searchGlossary, !wolfram', 'user');
    })
    if (_.startsWith(_.lowerCase(text), 'damn you')) {
      let target = text.substr(9)
      bot.say(config.channels[0], 'We will come down on ' + target + ' like the hammer of Thor.');
      bot.say(config.channels[0], 'The thunder of my vengeance will echo through their heart like the gust of a thousand winds!');
    }

    //any utils here - though, maybe utils should have their own folder
    linkQuery(bot, config, text)
  })
  // if (_.startsWith(text.toLowerCase(), prefix + 'latestupdate')) {
  //   getLatestUpdate(bot, config)
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'pootsquote')) {
  //   pootsQuote(bot, config)
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'glossary')) {
  //   glossaryPlugin.getGlossary(bot, config, text)
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'searchglossary')) {
  //   glossaryPlugin.searchGlossary(bot, config, text)
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'wolfram')) {
  //   wolfram(bot, config, text)
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'version')) {
  //   bot.say(config.channels[0], 'PootsBot version: ' + process.env.POOTSBOT_VERSION);
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'miniinfo')) {
  //   minisPlugin.getMiniInfo(bot, config, text)
  // }
  // if (_.startsWith(text.toLowerCase(), prefix + 'searchmini')) {
  //   minisPlugin.searchMinis(bot, config, text)
  // }
}

module.exports = _.curry(listen)
