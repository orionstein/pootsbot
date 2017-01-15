let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')


module.exports = function(match, say) {

  let glossary
  let latestUpdated

  function pullGlossary(cb) {
    if (!glossary) {
      request({
        url: 'https://www.kingdomdeath.com/tools/json/gloss-main.json',
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
        url: 'https://www.kingdomdeath.com/tools/json/gloss-main.json',
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

  match('glossary', function(search) {
    let isnum = /^\d+$/.test(search);

    pullGlossary(function(body) {
      let entry
      if (isnum) {
        entry = _.find(body.glossary, function(a) {
          return ~~a.id === ~~search
        })
      } else {
        entry = _.find(body.glossary, function(a) {
          return _.lowerCase(a.entry_title) === _.lowerCase(search)
        })
      }
      if (entry) {
        say("Entry " + search + ": " + entry.entry_title + ' -- ' + entry.entry_content);
      } else {
        say("Entry " + search + " was not found");
      }
    });
  })

  function reduceEntries(entries) {
    return _.reduce(entries, function(str, entry) {
      if (entry.id === _.last(entries).id) {
        return str + entry.id
      } else {
        return str + entry.id + ', '
      }
    // return (entry.id === _.last(entries).id) ? (str + entry.id) : (str + entry.id + ', ')
    // bahaa i'm not that mean
    }, '')
  }

  match('searchglossary', function(search) {
    pullGlossary(function(body) {
      let entry
      entry = _.filter(body.glossary, function(a) {
        return _.includes(_.lowerCase(a.entry_content), _.lowerCase(search))
      })

      if (entry) {
        if (_.size(entry) > 20) {
          say("Matching Entries: " + reduceEntries(_.take(entry, 20)) + " and " + (_.size(entry) - 20) + " more...");
        } else {
          say("Matching Entries: " + reduceEntries(entry));
        }
      } else {
        say("No Matching Entries for " + search);
      }

    });
  })

}
