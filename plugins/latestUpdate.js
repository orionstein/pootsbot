let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

let updateNS = store.createNameSpace('latestUpdate')
//
// updateNS.set('test', {
//   thing: '123'
// })

const daysSince = (date) => {
  let dateOne = moment(date, 'MMMM Do YYYY')
  let dateTwo = moment(Date.now())
  return dateTwo.diff(dateOne, 'days')
}

module.exports = (match, say) => {
  match(['update', 'latestupdate'], function() {
    request('http://www.kicktraq.com/projects/poots/kingdom-death-monster-15/', function(error, res, body) {
      if (!error) {
        let $ = cheerio.load(body);
        let entry = $('#projectnews').find('.newscolumn.first')
        let url = entry.find('.update a').first().attr('href')
        let title = entry.find('.update a').first().text()
        let date = entry.find('.source').first().text().split('-')[0].trim()
        say("Latest update - " + title + ' - ' + url);

        updateNS.tempMatch('days', () => {
          let days = daysSince((date + ' 2017'))
          say(days + ' days since last update!');
        })

      }
    })
  })

}
