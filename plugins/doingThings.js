let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

let listeningTo = store.createNameSpace('listeningTo')
let watching = store.createNameSpace('watching')
let playing = store.createNameSpace('playing')

module.exports = (match, say) => {
  match(['playing', 'play'], (search) => {
    if (search) {
      playing.set(say.prototype.from, search)
      say("You're playing " + search + "!")
    } else {
      let playingData = playing.get()
      _.forEach(playingData, (game, player) => {
        say(player + " is playing " + game)
      })
    }
  })
  match(['watching', 'watch'], (search) => {
    if (search) {
      watching.set(say.prototype.from, search)
      say("You're watching " + search + "!")
    } else {
      let watchingData = watching.get()
      _.forEach(watchingData, (show, watcher) => {
        say(watcher + " is watching " + show)
      })
    }
  })
  match(['listening', 'listen', 'listeningto'], (search) => {
    if (search) {
      listeningTo.set(say.prototype.from, search)
      say("You're listening to " + search + "!")
    } else {
      let listeners = listeningTo.get()
      _.forEach(listeners, (song, listener) => {
        say(listener + " is listening to " + song)
      })
    }
  })
}
