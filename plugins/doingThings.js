let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

// let listeningTo = store.createNameSpace('listeningTo')
// let watching = store.createNameSpace('watching')
// let playing = store.createNameSpace('playing')
let iam = store.createNameSpace('iam')

const matchEmpty = (text) => {
  return (text.trim() === 'nothing') ||
    (text.trim() === 'to nothing') ||
    (text.trim() === 'doing nothing') ||
    (text.trim() === 'clear')

}

const init = (bot) => {
  bot.addListener("nick", function(oldNick, newNick) {
    if (iam.has(oldNick)) {
      iam.move(oldNick, newNick)
    }
  });
}

function doing(match, say) {
  match(['iam'], (search) => {
    if (search) {
      if (matchEmpty(search)) {
        iam.unset(say.prototype.from)
        say('Cleared!', "user")
      } else {
        iam.set(say.prototype.from, search)
        say("You're " + search + "!", "user")
      }
    } else {
      let iamData = iam.get()
      _.forEach(iamData, (iamThing, player) => {
        say(player + " is " + iamThing)
      })
    }
  })
  match(['playing', 'play'], (search) => {
    if (search) {
      iam.set(say.prototype.from, 'playing ' + search)
      say("You're playing " + search + "!", "user")
    }
  })
  match(['watching', 'watch'], (search) => {
    if (search) {
      iam.set(say.prototype.from, 'watching ' + search)
      say("You're watching " + search + "!", "user")
    }
  })
  match(['listening', 'listen', 'listeningto'], (search) => {
    if (search) {
      iam.set(say.prototype.from, 'listening to ' + search)
      say("You're listening to " + search + "!", "user")
    }
  })
}

doing.prototype.init = init

module.exports = doing
