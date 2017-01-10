// Get the lib
let irc = require('irc')
let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

// request('https://www.kickstarter.com/projects/poots/kingdom-death-monster-15/updates', function(error, res, body) {
//     if (!error) {
//       let $ = cheerio.load(body);
//       let url = $('.NS_projects__updates_section').find('.grid-post.link').attr('href').trim()
//       let title = $('.NS_projects__updates_section').find('.grid-post__title').first().text().trim()
//     }
// })
//

let command = '!glossary 1'
command = '!glossary gear'
let search = command.substr(command.indexOf(' ')+1)

let isnum = /^\d+$/.test(search);
console.log(isnum)

request({
  url: 'http://www.kingdomdeath.com/tools/json/gloss-main.json',
  method: 'HEAD'
}, function(error, res, body) {
  if (!error) {
    let entry
    if (isnum)
    {
      entry = body.glossary[search]
    }
    else
    {
      entry = _.filter(body.glossary, function(a){ return _.includes(_.lowerCase(a.entry_content), _.lowerCase(search)) })
    }
    console.log(res.headers['last-modified'])
  }
})
