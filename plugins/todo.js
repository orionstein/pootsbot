let _ = require('lodash')

const hitLocationDie = ['body', 'body', 'waist', 'hands', 'legs', 'head']

module.exports = function(match, say) {
  match(['todo'], function(search) {
    console.log(search)
    if (!search) {
    } else if (_.startsWith(search.trim(), 'help')) {
    } else if (_.startsWith(search.trim(), 'hunt')) {
    } else {
      let num = search.split('d')[0]
      let type = search.split('d')[1]
      let results = []
      if (type === 'hl') {
        for (i = 0; i < num; i++) {
          results.push(_.sample(hitLocationDie))
        }
      } else {
        for (i = 0; i < num; i++) {
          results.push(Math.floor(Math.random() * type) + 1)
        }
      }
      if (type !== 'hl') {
        say('Total: ' + _.sum(results))
      }
      console.log(results)
      let resultString = _.join(results, ', ')
      console.log(resultString)
      say(resultString)
    }
  })
}

