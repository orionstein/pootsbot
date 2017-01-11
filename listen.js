let _ = require('lodash')
let getLatestUpdate = require('./plugins/latestUpdate')
let pootsQuote = require('./plugins/pootsQuote')
let glossaryPlugin = require('./plugins/glossary')
let prefix = process.env.POOTSBOT_PREFIX || '!'
let wolfram = require('./plugins/wolfram')
let linkQuery = require('./plugins/linkQuery')
let minisPlugin = require('./plugins/kd_miniatures')

function listen(bot, config, from, to, text, message) {
  if (_.startsWith(text.toLowerCase(), prefix + 'latestupdate')) {
    getLatestUpdate(bot, config)
  }
  if (_.startsWith(text.toLowerCase(), prefix + 'pootsquote')) {
    pootsQuote(bot, config)
  }
  if (_.startsWith(text.toLowerCase(), prefix + 'glossary')) {
    glossaryPlugin.getGlossary(bot, config, text)
  }
  if (_.startsWith(text.toLowerCase(), prefix + 'searchglossary')) {
    glossaryPlugin.searchGlossary(bot, config, text)
  }
  if (_.startsWith(text.toLowerCase(), prefix + 'wolfram')) {
    wolfram(bot, config, text)
  }
  if (_.startsWith(_.lowerCase(text), 'damn you'))
  {
    let target = text.substr(9)
    bot.say(config.channels[0], 'We will come down on ' + target + ' like the hammer of Thor.');
    bot.say(config.channels[0], 'The thunder of my vengeance will echo through their heart like the gust of a thousand winds!');
  }
  if (_.startWith(text.toLowerCase(), prefix + 'miniinfo')) {
    minisPlugin.getMiniInfo(bot, config, text)
  }
  if (_.startWith(text.toLowerCase(), prefix + 'searchmini')) {
    minisPlugin.searchMinis(bot, config, text)
  }
  linkQuery(bot, config, text)
}

module.exports = _.curry(listen)
