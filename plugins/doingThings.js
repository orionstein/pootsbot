let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

let listeningTo = store.createNameSpace('listeningTo')
let watching = store.createNameSpace('watching')
let playing = store.createNameSpace('playing')

const matchEmpty = (text) => {
  return (text.trim() === 'nothing') ||
    (text.trim() === 'to nothing')
}

module.exports = (match, say) => {
  match(['playing', 'play'], (search) => {
    if (search) {
      if (matchEmpty(search)) {
        playing.unset(say.prototype.from)
        say('Game cleared!', "user")
      } else {
        playing.set(say.prototype.from, search)
        say("You're playing " + search + "!", "user")
      }
    } else {
      let playingData = playing.get()
      _.forEach(playingData, (game, player) => {
        say(player + " is playing " + game)
      })
    }
  })
  match(['watching', 'watch'], (search) => {
    if (search) {
      if (matchEmpty(search)) {
        watching.unset(say.prototype.from)
        say('Watching cleared!', "user")
      } else {
        watching.set(say.prototype.from, search)
        say("You're watching " + search + "!", "user")
      }
    } else {
      let watchingData = watching.get()
      _.forEach(watchingData, (show, watcher) => {
        say(watcher + " is watching " + show)
      })
    }
  })
  match(['listening', 'listen', 'listeningto'], (search) => {
    if (search) {
      if (matchEmpty(search)) {
        listeningTo.unset(say.prototype.from, "user")
        say('Song cleared!')
      } else {
        listeningTo.set(say.prototype.from, search)
        say("You're listening to " + search + "!", "user")
      }
    } else {
      let listeners = listeningTo.get()
      _.forEach(listeners, (song, listener) => {
        say(listener + " is listening to " + song)
      })
    }
  })
  say.prototype.bot.addListener("nick", function(oldNick, newNick) {
    if (playing.has(oldNick)) {
      playing.move(oldNick, newNick)
    }
    if (watching.has(oldNick)) {
      watching.move(oldNick, newNick)
    }
    if (listeningTo.has(oldNick)) {
      listeningTo.move(oldNick, newNick)
    }
  });
}
