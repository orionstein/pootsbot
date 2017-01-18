let irc = require('irc')
let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('./utils/store')

let config = {
  channels: [(process.env.POOTSBOT_CHANNEL)],
  server: "irc.freenode.net",
  botName: process.env.POOTSBOT_NAME,
  autoRejoin: true,
  retryCount: 2,
  password: process.env.POOTSBOT_PASSWORD,
  get botName () {
    if (process.env.POOTSBOT_NAME == undefined) return "pootsbot";
    return process.env.POOTSBOT_NAME;
  }
};

let bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

let opList = process.env.POOTSBOT_OPERATORS.split(',') || []

bot.addListener('registered', function() {
  bot.send('nick', config.botName);
  bot.say('nickserv', 'identify ' + config.password);
  bot.say(config.channels[0], config.botName + ' Online');
})

bot.addListener('error', function(message) {
  console.log('error: ', message);
});

bot.addListener("quit", function(channel, who) {
  if (who === config.botName) {
    bot.send('nick', config.botName);
  }
});

bot.addListener("join", function(channel, who) {
  let voiceComm = channel + ' ' + who;
  if (who !== config.botName) {
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

let listen = require('./listen.js')

listen.prototype.init(bot)

/*
bot.addListener("raw", function(message) {
  console.log('raw: ', message);
});
*/

bot.addListener("message", _.curry(listen)(bot, config));
