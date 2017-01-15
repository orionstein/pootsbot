let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

let listeningTo = store.createNameSpace('listeningTo')

// updateNS.set('test', {
//   thing: '123'
// })

module.exports = (match, say) => {
  match(['listening', 'listen', 'listeningto'], (search) => {
    if (search)
    {
      listeningTo.set(say.prototype.from, search)
      say("You're listening to " + search + "!")
    }
    else
    {
      let listeners = listeningTo.get()
      _.forEach(listeners, (song, listener) => {
        say(listener + " is listening to " + song)
      })
    }
  })
}
