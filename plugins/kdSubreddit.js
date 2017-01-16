let request = require('request')
let cheerio = require('cheerio')
let _ = require('lodash')
let async = require('async')
let store = require('../utils/store')
let moment = require('moment')

module.exports = (match, say) => {
  match(['reddit', 'kdreddit'], (search) => {
    let reqString = 'https://www.reddit.com/r/kingdomdeath/hot.json?limit=5'
    if (search === 'new') {
      reqString = 'https://www.reddit.com/r/kingdomdeath/new.json?limit=5'
    } else if (search === 'top') {
      reqString = 'https://www.reddit.com/r/kingdomdeath/top.json?limit=5'
    }
    request({
      url: reqString,
      json: true
    }, (error, res, body) => {
      if (!error) {
        console.log(body)
        if (body && body.data && body.data.children) {
          _.forEach(body.data.children, (post) => {
            if (post.data && post.data.title && post.data.url && !post.data.stickied)
            {
              say(post.data.title + ' - ' + post.data.url)
            }
          })
        }
      }
    })
  })

}
