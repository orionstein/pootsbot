let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

let updateNS = store.createNameSpace('latestUpdate')

updateNS.set('test', {
  thing: '123'
})

const daysSince = (date) => {
  let dateOne = moment(new Date(date))
  let dateTwo = moment(Date.now())
  return dateTwo.diff(dateOne, 'days')
}

module.exports = (match, say) => {
  match(['update', 'latestupdate'], function() {
    request('http://www.kicktraq.com/projects/poots/kingdom-death-monster-15/', function(error, res, body) {
      if (!error) {
        let $ = cheerio.load(body);
        let url = $('#projectnews').find('.update a').first().attr('href')
        let title = $('#projectnews').find('.update a').first().text()
        say("Latest update - " + title + ' - ' + url);

        updateNS.tempMatch('days', () => {
          let days = daysSince(res.headers['last-modified'])
          say(days + ' days since last update!');
        })

      }
    })
  })

}
