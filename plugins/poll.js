let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

let polls = store.createNameSpace('polls')

module.exports = (match, say) => {
  const listPolls = (pollList) => {
    let takeList = _.take(pollList, 5)
    let dropList = _.drop(pollList, 5)
    _.forEach(takeList, (poll) => {
      say(poll.title + ' - ' + poll.url)
    })
    if (dropList.length > 0) {
      polls.tempMatch('more', () => {
        listPolls(dropList)
      })
    }
  }
  match(['poll', 'createpoll'], (search) => {
    let multiSetting = false;
    if (!search) {
      listPolls(polls.get().polls)
    } else if (_.startsWith(search.trim(), 'help')) {
      say('Create a new Poll with !poll {Question}? {Option1}, {Option2}...')
      say('List Polls by just writing !poll')
    } else if (_.startsWith(search.trim(), 'remove')) {
      // search = search.substr(6).trim()
      // let pollList = polls.get().polls
      // console.log(search)
      // console.log(pollList)
      // let rm = _.pullAllWith(pollList, [search], (p, s) => {
      //   console.log(p)
      //   let aa = ~~p.id === ~~search
      //   console.log(aa)
      //   return aa
      // })
      // console.log(rm)
      // console.log(rm.length)
      // console.log(pollList.length)
      // polls.set('polls', rm)
      // if (rm.length != pollList.length)
      // {
      //   say('Poll Removed', 'user')
      // }
      // else
      // {
      //   say('Poll not found', 'user')
      // }
    } else {
      if (_.startsWith(search.trim(), 'multi')) {
        search = search.substr(5).trim()
        multiSetting = true
      }
      let parse = search.split('?')
      let question = parse[0]
      let options = parse[1].split(',')
      let reqBody = {
        title: (question + '?'),
        options: options
      }
      console.log(reqBody)
      let req = {
        url: 'https://strawpoll.me/api/v2/polls',
        json: true,
        method: 'POST',
        body: reqBody,
        multi: multiSetting,
        followAllRedirects: true,
        headers: {
          'content-type': 'application/json'
        }
      }
      request(req, (error, res, body) => {
        if (!error) {
          let newPoll = {
            id: body.id,
            title: body.title,
            url: 'http://www.strawpoll.me/' + body.id
          }
          let pollObj = polls.get()
          let newPolls = pollObj.polls || []
          newPolls.push(newPoll)
          polls.set('polls', newPolls)
          say('Poll created at ' + newPoll.url, 'user')
          say('To remove poll, use !poll remove ' + newPoll.id, 'user')
          say.prototype.bot.say('chanserv', 'set ' + say.prototype.channelConf + ' ENTRYMSG ' + 'New Poll: ' + newPoll.title + ' - ' + newPoll.url);
        } else {
          console.log(error)
        }
      })
    }
  })
}
