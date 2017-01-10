let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

function getLatestUpdate(bot, config) {
  request('https://www.kickstarter.com/projects/poots/kingdom-death-monster-15/updates', function(error, res, body) {
    if (!error) {
      let $ = cheerio.load(body);
      let url = $('.NS_projects__updates_section').find('.grid-post.link').attr('href').trim()
      let fullUrl = 'https://www.kickstarter.com' + url;
      let title = $('.NS_projects__updates_section').find('.grid-post__title').first().text().trim()
      bot.say(config.channels[0], "Latest update - " + title + ' - ' + fullUrl);
    }
  })
}

module.exports = getLatestUpdate
