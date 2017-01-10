let _ = require('lodash')
let getLatestUpdate = require('./plugins/latestUpdate')
let pootsQuote = require('./plugins/pootsQuote')
let glossaryPlugin = require('./plugins/glossary')
let prefix = process.env.POOTSBOT_PREFIX || '!'

function listen(bot, config, from, to, text, message) {
  if (_.startsWith(text, prefix + 'latestUpdate')) {
    getLatestUpdate(bot, config)
  }
  if (_.startsWith(text, prefix + 'PootsQuote')) {
    pootsQuote(bot, config)
  }
  if (_.startsWith(text, prefix + 'glossary')) {
    glossaryPlugin.getGlossary(bot, config, text)
  }
  if (_.startsWith(text, prefix + 'searchGlossary')) {
    glossaryPlugin.searchGlossary(bot, config, text)
  }
}

module.exports = _.curry(listen)
