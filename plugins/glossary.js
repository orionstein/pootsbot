let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

let glossary
let latestUpdated

function pullGlossary(cb) {
  if (!glossary) {
    request({
      url: 'http://www.kingdomdeath.com/tools/json/gloss-main.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        glossary = body
        latestUpdated = res.headers['last-modified']
        cb(body)
      }
    });
  } else {
    request({
      url: 'http://www.kingdomdeath.com/tools/json/gloss-main.json',
      method: 'HEAD'
    }, function(error, res) {
      if (latestUpdated === res.headers['last-modified']) {
        cb(glossary)
      } else {
        glossary = void 0;
        pullGlossary(cb)
      }
    });
  }
}

function getGlossary(bot, config, command) {
  let search = command.substr(command.indexOf(' ') + 1)
  let isnum = /^\d+$/.test(search);

  pullGlossary(function(body) {
    let entry
    if (isnum) {
      entry = body.glossary[search]
    } else {
      entry = _.find(body.glossary, function(a) {
        return _.lowerCase(a.entry_title) === _.lowerCase(search)
      })
    }
    if (entry) {
      bot.say(config.channels[0], "Entry " + search + ": " + entry.entry_title + ' -- ' + entry.entry_content);
    } else {
      bot.say(config.channels[0], "Entry " + search + " was not found");
    }
  });
}

function reduceEntries(entries) {
  return _.reduce(entries, function(str, entry) {
    if (entry.id === _.last(entries).id) {
      return str + entry.id
    } else {
      return str + entry.id + ', '
    }
  }, '')
}

function searchGlossary(bot, config, command) {
  let search = command.substr(command.indexOf(' ') + 1)
  pullGlossary(function(body) {
    let entry
    entry = _.filter(body.glossary, function(a) {
      return _.includes(_.lowerCase(a.entry_content), _.lowerCase(search))
    })

    if (entry) {
      if (_.size(entry) > 20) {
        bot.say(config.channels[0], "Matching Entries: " + reduceEntries(_.take(entry, 20)) + " and " + (_.size(entry) - 20) + " more...");
      } else {
        bot.say(config.channels[0], "Matching Entries: " + reduceEntries(entry));
      }
    } else {
      bot.say(config.channels[0], "No Matching Entries for " + search);
    }

  });
}

module.exports = {
  getGlossary: getGlossary,
  searchGlossary: searchGlossary
}
