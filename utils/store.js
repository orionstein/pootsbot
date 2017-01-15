let _ = require('lodash')
let uuid = require('node-uuid')

let timeOutVal = process.env.POOTSBOT_TEMPMATCH_TIMEOUT || 100000

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
  function Namespace(name) {
    if (namespaces[name]) {
      console.log('namespace is already assumed')
      return false
    }
    let _this = this
    _this.name = name
    _this.data = {}
    return {
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
      let ns = new Namespace(name)
      namespaces[name] = ns
      return ns
    },
    getNamespaces: () => {
      return _.keys(namespaces)
    },
    getNamespace: (name) => {
      return namespaces[name]
    },
    runTempMatches: runTempMatches,
    clearTempmatches: clearTempmatches
  }
}

module.exports = new Store()
