let request = require('request');
let cheerio = require('cheerio');
let _ = require('lodash');
let async = require('async');
let store = require('../utils/store');
let miniatures = store.createNameSpace('miniatures');
let query = require('json-query')

let cmds = "help|" +
  "all|" +
  "summary|sum|summery|info|information|" +
  "sculptor|sculpt|sculpter|" +
  "artist|" +
  "status|stat|" +
  "firstsold|sold|first|" +
  "gameplay|game|" +
  "notes|note|" +
  "lore|" +
  "art|artwork|concept|conceptart|" +
  "pictures|pic|picture|" +
  "buildguide|build|guide|" +
  "sets|set";
let alreadyPulledData = false;
let data = {}
// let dataMinis;
// let dataArtists;
// let dataSculptors;
// let dataSets;
// let dataStatus;
let latestUpdateMinis;
let latestUpdateSculptors;
let latestUpdateSets;
let latestUpdateStatus;

function pullDataMinis(cb) {
  if (!data.minis) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-minis.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        data.minis = body;
        latestUpdateMinis = res.headers['last-modified'];
        cb(body)
      }
    });
  } else {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-minis.json',
      method: 'HEAD'
    }, function(error, res) {
      if (latestUpdateMinis === res.headers['last-modified']) {
        cb(data.minis)
      } else {
        data.minis = void 0;
        pullDataMinis(cb)
      }
    });
  }
}
function pullDataArtists(cb) {
  if (!data.artists) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_artist.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        data.artists = body;
        latestUpdateArtists = res.headers['last-modified'];
        cb(body)
      }
    });
  } else {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_artist.json',
      method: 'HEAD'
    }, function(error, res) {
      if (latestUpdateArtists === res.headers['last-modified']) {
        cb(data.artists)
      } else {
        data.artists = void 0;
        pullDataArtists(cb)
      }
    });
  }
}
function pullDataSculptors(cb) {
  if (!data.sculptors) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_sculptor.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        data.sculptors = body;
        latestUpdateSculptors = res.headers['last-modified'];
        cb(body)
      }
    });
  } else {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_sculptor.json',
      method: 'HEAD'
    }, function(error, res) {
      if (latestUpdateSculptors === res.headers['last-modified']) {
        cb(data.sculptors)
      } else {
        data.sculptors = void 0;
        pullDataSculptors(cb)
      }
    });
  }
}
function pullDataSets(cb) {
  if (!data.sets) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_sets.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        data.sets = body;
        latestUpdateSets = res.headers['last-modified'];
        cb(body)
      }
    });
  } else {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_sets.json',
      method: 'HEAD'
    }, function(error, res) {
      if (latestUpdateSets === res.headers['last-modified']) {
        cb(data.sets)
      } else {
        data.sets = void 0;
        pullDataSets(cb)
      }
    });
  }
}
function pullDataStatus(cb) {
  if (!data.status) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_status.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        data.status = body;
        latestUpdateStatus = res.headers['last-modified'];
        cb(body)
      }
    });
  } else {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_status.json',
      method: 'HEAD'
    }, function(error, res) {
      if (latestUpdateStatus === res.headers['last-modified']) {
        cb(data.status)
      } else {
        data.status = void 0;
        pullDataStatus(cb)
      }
    });
  }
}

function loadData() {
  let snork;
  pullDataStatus(function(snork) {});
  pullDataArtists(function(snork) {});
  pullDataSculptors(function(snork) {});
  pullDataMinis(function(snork) {});
  pullDataSets(function(snork) {});
}

const init = (bot) => {
  loadData();
};

//match(['miniinfo', 'mini', 'min'], showMiniInfo);



let defaultResponse = "summary";

function parseCommand(fullcmd) {
  let parsed = {
    cmd: '',
    scmd: defaultResponse,
    srch: '',
    isId: false
  };
  if (!fullcmd) {
    parsed.scmd = 'help';
    return parsed;
  }
  fullcmd = (fullcmd.replace(/[\s\n\r]+/g, ' ')).trim();
  let parser = fullcmd.split(' ');
  parsed.cmd = parser[0];
  if (_.includes(cmds, parsed.cmd)) {
    parsed.scmd = parsed.cmd
    parsed.srch = parser.slice(1).join(' ');
  } else {
    parsed.srch = parser.join(' ');
  }
  parsed.isId = /^\d+$/.test(parsed.srch);
  return parsed
}

function joinMiniData(search) {
  console.log('searching')
  let helpers = {
    expand: (input) => {
      return _.map(input, (origItem) => {
        let item = Object.assign({}, origItem)
        item.min_sculptor = query('data.sculptors.min_sculptors[{match.min_sculptor}]', {
          data: {
            match: item,
            data
          }
        }).value

        item.min_artist = query('data.artists.min_artists[{match.min_artist}]', {
          data: {
            match: item,
            data
          }
        }).value

        console.log(item)
        if (!_.isEmpty(item.min_sets)) {
          let sets = item.min_sets.split(',')
          let matchSetQuery = _.map(sets, (item) => {
            return `set_id=${item.trim()}`
          }, '').join('||')

          item.min_sets = query(`data.sets.min_sets[*${matchSetQuery}]`, {
            data: {
              data
            }
          }).value
        }

        item.min_status = query('data.status.min_status[{match.min_status}]', {
          data: {
            match: item,
            data
          }
        }).value

        return item;
      })
    }
  }
  let queryString = `minis[*min_id=${search}||min_name~/${search}/i]:expand(?)`
  let match = query(queryString, {
    data: data.minis,
    locals: helpers,
    allowRegexp: true
  })
  return match.value
}

//let say = new Say(bot, config, from, to)
function showMiniInfo(say, fullcmd) {
  parsed = parseCommand(fullcmd);
  let entry;

  entries = joinMiniData(parsed.srch)

  if (entries.length > 1) {
    say(`Found ${entries.length} entries`);
    entries.map(function(entry) {
      say(`Id ${entry.min_id} - ${entry.min_name}`)
    })
  } else {
    _.forEach(entries, (entry) => {
      if (entry) {
        switch (parsed.scmd) {
          case "sum":
          case "summ":
          case "summery":
          case "summary":
            say(entry.min_name + "\n  Summary:  " + entry.min_summary);
            miniatures.tempMatch('more', () => {
              showMiniInfo(say, 'lore ' + parsed.srch)
            });
            break;
          case "lore":
            say(entry.min_name + "\n  Lore:  " + entry.min_lore);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, 'sculptor ' + parsed.srch)
            });
            break;
          case "sculpt":
          case "sculpter":
          case "sculptor":
            say(entry.min_name + "\n  Sculptor:  " + entry.min_sculptor.sculptor_name);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, 'artist ' + parsed.srch)
            });
            break;
          case "artist":
            say(entry.min_name + "\n  Artist:  " + entry.min_artist.artist_name);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, 'notes ' + parsed.srch)
            });
            break;
          case "note":
          case "notes":
            say(entry.min_name + "\n  Notes:  " + entry.min_notes);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, 'art ' + parsed.srch)
            });
            break;
          case "art":
          case "artwork":
            say(entry.min_name + "\n  Artwork:  " + entry.min_artwork);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, 'pic ' + parsed.srch)
            });
            break;
          case "pic":
          case "picture":
          case "pictures":
            say(entry.min_name + "\n  Pictures:  " + entry.min_pictures);
            break;
          default:
            say(entry.min_name + "\n  Yeah, it exists. What of it? :p");
        }
      // list search, etc.
      } else {
        if (parsed.isId) {
          say("There is no miniature with index #" + parsed.srch + " was not found.");
        } else {
          say("The miniature '" + parsed.srch + "' was not found.");
        }
      }
    })
  }
}

function minis(match, say) {
  match(['miniinfo', 'mini', 'min'], _.curry(showMiniInfo)(say));
  match(['minirefresh'], init);
}

minis.prototype.init = init;
module.exports = minis;
