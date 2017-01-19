let request = require('request');
let cheerio = require('cheerio');
let _ = require('lodash');
let async = require('async');
let store = require('../utils/store');
let miniatures = store.createNameSpace('miniatures');

let cmds =
  "help|" +
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
let dataMinis;
let dataArtists;
let dataSculptors;
let dataSets;
let dataStatus;
let latestUpdateMinis;
let latestUpdateSculptors;
let latestUpdateSets;
let latestUpdateStatus;

function pullDataMinis(cb) {
  if (!dataMinis) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-minis.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        dataMinis = body;
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
        cb(dataMinis)
      } else {
        dataMinis = void 0;
        pullDataMinis(cb)
      }
    });
  }
}
function pullDataArtists(cb) {
  if (!dataArtists) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_artist.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        dataArtists = body;
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
        cb(dataArtists)
      } else {
        dataArtists = void 0;
        pullDataArtists(cb)
      }
    });
  }
}
function pullDataSculptors(cb) {
  if (!dataSculptors) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_sculptor.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        dataSculptors = body;
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
        cb(dataSculptors)
      } else {
        dataSculptors = void 0;
        pullDataSculptors(cb)
      }
    });
  }
}
function pullDataSets(cb) {
  if (!dataSets) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_sets.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        dataSets = body;
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
        cb(dataSets)
      } else {
        dataSets = void 0;
        pullDataSets(cb)
      }
    });
  }
}
function pullDataStatus(cb) {
  if (!dataStatus) {
    request({
      url: 'http://www.rubidiumhexafluorosilicate.com/kd/kd-min_status.json',
      json: true
    }, function(error, res, body) {
      if (!error) {
        dataStatus = body;
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
        cb(dataStatus)
      } else {
        dataStatus = void 0;
        pullDataStatus(cb)
      }
    });
  }
}

function isDataLoaded() {
  if (!alreadyPulledData) {
    let snork;
    pullDataStatus(function(snork){});
    pullDataArtists(function(snork){});
    pullDataSculptors(function(snork){});
    pullDataMinis(function(snork){});
    pullDataSets(function(snork){});
    alreadyPulledData = true;
  }
}

//isDataLoaded();

module.exports = function(match, say) {

  let defaultResponse = "summary";
  isDataLoaded();

  function parseCommand(fullcmd) {
    let parsed = {
      cmd: '',
      scmd: defaultResponse,
      srch: '',
      isId: false
    };
    fullcmd = (fullcmd.replace( /[\s\n\r]+/g, ' ' )).trim();
    let parser = fullcmd.split(' ');
    parsed.cmd = parser[0];
    if (parser.length <= 1) {
      parsed.scmd = 'help';
      return parsed;
    }
    if (parser[1].match(cmds)) {
      if (parser.length >= 3) {
        parser[2] = parser.slice(2).join(' ');
      }
    } else {
      if (parser.length >=2) {
        parser[2] = parser.slice(1).join(' ');
        parser[1] = defaultResponse;
      }
    }
    parsed.scmd = parser[1].toLowerCase();
    parsed.srch = parser[2].toLowerCase();
    parsed.isId = /^\d+$/.test(parsed.srch);
    return parsed
  }


  //let say = new Say(bot, config, from, to)
  function showMiniInfo(subcmd, fullcmd) {
    isDataLoaded();
    parsed = parseCommand(fullcmd);


    pullDataMinis(function(body) {
      let entry;
      if (parsed.isId) {
        entry = _.find(dataMinis.minis, function (a) {
          return ~~a.id === ~~parsed.srch
        })
      } else {
        entry = _.find(dataMinis.minis, function (a) {
          return _.lowerCase(a.min_name) === parsed.srch
        })
      }
      if (entry) {
        switch (parsed.scmd) {
          case "sum":
          case "summ":
          case "summery":
          case "summary":
            say(entry.min_name + "\n  Summary:  " + entry.min_summary);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' lore ' + parsed.srch)
            });
            break;
          case "lore":
            say(entry.min_name + "\n  Lore:  " + entry.min_lore);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' sculptor ' + parsed.srch)
            });
            break;
          case "sculpt":
          case "sculpter":
          case "sculptor":
            say(entry.min_name + "\n  Sculptor:  " + entry.min_sculptor);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' artist ' + parsed.srch)
            });
            break;
          case "artist":
            say(entry.min_name + "\n  Artist:  " + entry.min_artist);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' notes ' + parsed.srch)
            });
            break;
          case "note":
          case "notes":
            say(entry.min_name + "\n  Notes:  " + entry.min_notes);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' art ' + parsed.srch)
            });
            break;
          case "art":
          case "artwork":
            say(entry.min_name + "\n  Artwork:  " + entry.min_artwork);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' pic ' + parsed.srch)
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




  match(['miniinfo', 'mini', 'min'], showMiniInfo);

  /*
  function reduceMinis(entries) {
    return _.reduce(entries, function(str, entry) {
      if (entry.id === _.last(entries).id) {
        return str + entry.id
      } else {
        return str + entry.id + ', '
      }
    // return (entry.id === _.last(entries).id) ? (str + entry.id) : (str + entry.id + ', ')
    // bahaa i'm not that mean (but why not??? >>grins<<)
    }, '')
  }

  match(['searchmini'], function(search) {
    pullDataMinis(function(body) {
      let entry;
      entry = _.filter(body.miniatures, function(a) {
        return _.includes(_.lowerCase(a.entry_content), _.lowerCase(search))
      });

      if (entry) {
        if (_.size(entry) > 20) {
          say("Matching Entries: " + reduceMinis(_.take(entry, 20)) + " and " + (_.size(entry) - 20) + " more...");
        } else {
          say("Matching Entries: " + reduceMinis(entry));
        }
      } else {
        say("No Matching Entries for " + search);
      }

    });
  })
  */
};
