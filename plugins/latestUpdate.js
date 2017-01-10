let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

function getLatestUpdate(bot, config) {
  request('http://www.kicktraq.com/projects/poots/kingdom-death-monster-15/', function(error, res, body) {
    if (!error) {
      let $ = cheerio.load(body);
      let url = $('#projectnews').find('.update a').first().attr('href')
      let title = $('#projectnews').find('.update a').first().text()
      bot.say(config.channels[0], "Latest update - " + title + ' - ' + url);
    }
  })
}

module.exports = getLatestUpdate
