let Client = require('node-wolfram');
let Wolfram = new Client(process.env.POOTSBOT_WOLFRAM_KEY);

module.exports = function(match, say) {
  match(['wolfram', 'wolframalpha'], function(search) {
    Wolfram.query(search, function(err, result) {
      if (err) {
        say('Wolfram Error');
      } else {
        if (result.queryresult && result.queryresult.pod) {
          if (result.queryresult.pod.length > 1) {
            let pod = result.queryresult.pod[1]
            if (pod.subpod) {
              let subpod = pod.subpod[0];
              let text = subpod.plaintext[0];
              say(pod.$.title + ': ' + text);
            } else {
              say('Wolfram Result not found');
            }
          } else {
            say('Wolfram Result not found');
          }
        } else if (result.queryresult && result.queryresult.didyoumeans) {
          // bot.say(config.channels[0], 'Wolfram Error');
          if (result.queryresult.didyoumeans[0] && result.queryresult.didyoumeans[0].didyoumean) {
            let dym = result.queryresult.didyoumeans[0].didyoumean;
            say('Wolfram Error, did you mean ' + dym._ + '?');
          } else {
            say('Wolfram Error');
          }
        } else {
          say('Wolfram Error');
        }
      }
    });
  })
}
