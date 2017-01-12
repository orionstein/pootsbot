let irc = require('irc')
let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')

let config = {
  channels: [process.env.POOTSBOT_CHANNEL],
  server: "irc.freenode.net",
  botName: "pootsbot",
  password: process.env.POOTSBOT_PASSWORD
};

let bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

bot.addListener('registered', function() {
  bot.say('nickserv', 'identify ' + config.password);
})

bot.addListener('error', function(message) {
    console.log('error: ', message);
});

bot.addListener("join", function(channel, who) {
  let voiceComm = channel + ' ' + who;
  if (who !== 'pootsbot')
  {
    try{
      bot.send('MODE', channel, '+v', who);
    }
    catch(e){
      console.log(e)
    }
  }
});

bot.addListener("message", require('./listen')(bot, config));
