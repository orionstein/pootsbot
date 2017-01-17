let _ = require('lodash')
let uuid = require('node-uuid')
let request = require('request')

let timeOutVal = process.env.POOTSBOT_TEMPMATCH_TIMEOUT || 100000
let storeApi = process.env.POOTSBOT_API_URL
let storeApiKey = process.env.POOTSBOT_API_KEY

const Store = function() {
  let namespaces = {
  }
  let tempMatches = []
  const clearTempmatches = () => {
    _.pullAllWith(tempMatches, '1', (matchF, id) => {
      return ((Date.now() - matchF.prototype.timestamp) > timeOutVal)
    })
  }
  const runTempMatches = (match, say) => {
    _.forEach(tempMatches, (tempMatch) => {
      tempMatch(match, say)
    })
    clearTempmatches()
  }
  function Tempmatch(toMatch, cb) {
    let _this = this
    _this.toMatch = toMatch
    _this.id = uuid.v1()
    _this.timestamp = Date.now()
    // tempMatches.push(_this)
    const matchFunc = (match, say) => {
      match(_this.toMatch, () => {
        cb()
        _.pullAllWith(tempMatches, _this.id, (matchF, id) => {
          return _this.id === matchF.prototype.id
        })
      })
    }
    matchFunc.prototype = _this
    return matchFunc
  }
  function Namespace(name, data) {
    if (namespaces[name]) {
      return false
    }
    let _this = this
    _this.name = name
    _this.data = data || {}
    return {
      has: (prop) => {
        return !!_this.data[prop]
      },
      get: (prop) => {
        if (prop) {
          return _.merge({}, {
            data: _.get(_this.data, prop)
          })
        } else {
          return _.merge({}, _this.data)
        }
      },
      set: (prop, data) => {
        if (!prop) {
          console.log('cant overwrite namespace')
          return
        } else {
          _this.data = _.merge({}, _this.data, {
            [prop]: data
          })
          if (storeApi && storeApiKey) {
            request({
              url: storeApi,
              method: 'POST',
              body: JSON.stringify({
                name: _this.name,
                data: _this.data
              }),
              headers: {
                'x-api-key': storeApiKey
              }
            }, () => {
              console.log('saved')
            })
          }
        }
      },
      unset: (prop) => {
        delete _this.data[prop]
        _this.data = Object.assign({}, _this.data)
      },
      move: (fromProp, toProp) => {
        if (!!_this.data[toProp] || !_this.data[fromProp]) {
          console.log('source prop must exist, and destination prop must be empty')
        } else {
          let newData = {
            [toProp]: _this.data[fromProp]
          }
          delete _this.data[fromProp]
          _this.data = Object.assign({}, _this.data, newData)
        }
      },
      tempMatch: (toMatch, cb) => {
        let tm = new Tempmatch(toMatch, cb)
        tempMatches.push(tm)
      }
    }
  }
  return {
    createNameSpace: (name) => {
      if (!!namespaces[name]) {
        return namespaces[name]
      } else {
        let ns = new Namespace(name)
        if (ns) {
          namespaces[name] = ns
        }
        return ns
      }
    },
    hasNamespace: (name) => {
      return !!namespaces[name]
    },
    getNamespaces: () => {
      return _.keys(namespaces)
    },
    getNamespace: (name) => {
      return namespaces[name]
    },
    init: (bot) => {
      if (storeApi && storeApiKey) {
        return request({
          url: storeApi,
          method: 'GET',
          json: true,
          headers: {
            'x-api-key': storeApiKey
          }
        }, (error, res, data) => {
          _.forEach(data.items, (item) => {
            let ns = new Namespace(item.name, item.data)
            if (ns) {
              namespaces[item.name] = ns
            }
          })
          // return bot.connect()
        })
      } else {
        // return bot.connect()
      }
    },
    runTempMatches: runTempMatches,
    clearTempmatches: clearTempmatches
  }
}

module.exports = new Store()
