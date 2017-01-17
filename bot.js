let irc = require('irc')
let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('./utils/store')

let config = {
  channels: [(process.env.POOTSBOT_CHANNEL || '#pootsbottest')],
  server: "irc.freenode.net",
  botName: "pootsbot",
  autoRejoin: true,
  retryCount: 2,
  password: process.env.POOTSBOT_PASSWORD
};

let bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

store.init(bot)

let opList = process.env.POOTSBOT_OPERATORS.split(',') || []

bot.addListener('registered', function() {
  bot.send('nick', 'pootsbot');
  bot.say('nickserv', 'identify ' + config.password);
  bot.say(config.channels[0], 'PootsBot Online');
})

bot.addListener('error', function(message) {
  console.log('error: ', message);
});

bot.addListener("quit", function(channel, who) {
  if (who === 'pootsbot') {
    bot.send('nick', 'pootsbot');
  }
});

bot.addListener("join", function(channel, who) {
  let voiceComm = channel + ' ' + who;
  if (who !== 'pootsbot') {
    try {
      bot.send('MODE', channel, '+v', who);
      if (_.includes(opList, who.toLowerCase())) {
        bot.send('MODE', channel, '+o', who);
      }
    } catch (e) {
      console.log(e)
    }
  }
});

bot.addListener("message", require('./listen')(bot, config));
