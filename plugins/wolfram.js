let Client = require('node-wolfram');
let Wolfram = new Client(process.env.POOTSBOT_WOLFRAM_KEY);

function wolfram(bot, config, command) {
  let search = command.substr(command.indexOf(' ') + 1)
  Wolfram.query(search, function(err, result) {
    if (err) {
      bot.say(config.channels[0], 'Wolfram Error');
    } else {
      if (result.queryresult && result.queryresult.pod) {
        if (result.queryresult.pod.length > 1)
        {
          let pod = result.queryresult.pod[1]
          if (pod.subpod)
          {
            let subpod = pod.subpod[0];
            let text = subpod.plaintext[0];
            bot.say(config.channels[0], pod.$.title + ': ' + text);
          }
          else {
            bot.say(config.channels[0], 'Wolfram Result not found');
          }
        }
        else {
          bot.say(config.channels[0], 'Wolfram Result not found');
        }
      } else if (result.queryresult && result.queryresult.didyoumeans) {
        // bot.say(config.channels[0], 'Wolfram Error');
        if (result.queryresult.didyoumeans[0] && result.queryresult.didyoumeans[0].didyoumean) {
          let dym = result.queryresult.didyoumeans[0].didyoumean;
          bot.say(config.channels[0], 'Wolfram Error, did you mean ' + dym._ + '?');
        } else {
          bot.say(config.channels[0], 'Wolfram Error');
        }
      } else {
        bot.say(config.channels[0], 'Wolfram Error');
      }
    }
  });
}

module.exports = wolfram
