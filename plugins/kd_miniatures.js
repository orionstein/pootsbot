let request = require('request');
let cheerio = require('cheerio');
let _ = require('lodash');
let async = require('async');
let store = require('../utils/store');
let miniatures = store.createNameSpace('miniatures');
let query = require('json-query');  //new

let cmds =
  "help|" +
  "all|" +
  "summary|sum|summery|info|information|" +
  "sculptor|sculpt|sculpter|" +
  "artist|conceptartist|" +
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
let data = {}; //new
//let dataMinis;
//let dataArtists;
//let dataSculptors;
//let dataSets;
//let dataStatus;
let latestUpdateMinis;
let latestUpdateArtists;
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
        //dataMinis = body;
        data.minis = body; //new
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
        //cb(dataMinis)
        cb(data.minis); //new
      } else {
        //dataMinis = void 0;
        data.minis = void 0; //new
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
        //dataArtists = body;
        data.artists = body; //new
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
        //cb(dataArtists)
        cb(data.artists); //new
      } else {
        //dataArtists = void 0;
        data.artists = void 0; //new
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
        //dataSculptors = body;
        data.sculptors = body; //new
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
        //cb(dataSculptors)
        cb(data.sculptors); //new
      } else {
        //dataSculptors = void 0;
        data.sculptors = void 0; //new
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
        //dataSets = body;
        data.sets = body; //new
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
        //cb(dataSets)
        cb(data.sets); //new
      } else {
        //dataSets = void 0;
        data.sets = void 0; //new
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
        //dataStatus = body;
        data.status = body; //new
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
        //cb(dataStatus)
        cb(data.status); //new
      } else {
        //dataStatus = void 0;
        data.status = void 0; //new
        pullDataStatus(cb)
      }
    });
  }
}

function isDataLoaded() { //new he changed name of this to loadData
  if (!alreadyPulledData) {
    let snork;
    pullDataStatus(function(snork){});
    pullDataArtists(function(snork){});
    pullDataSculptors(function(snork){});
    pullDataMinis(function(snork){});
    pullDataSets(function(snork){});
    alreadyPulledData = true; //new he did pull all the alreadypulledata bit out of this one
  }
}

const init = (bot) => {
  alreadyPulledData = false;
  isDataLoaded(); //new he changed name of this to loadData
};

let defaultResponse = "summary";

function parseCommand(fullcmd) {
  // he had switched this to just part command coming in, leaving as was for now
  //todo: check for scmd missing needed search data: ex: !min status
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
    } else {
      parser[2] = "";
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

function joinMiniData(search) {
  console.log('searching');
  let helpers = {
    expand: (input) => {
      return _.map(input, (origItem) => {
        let item = Object.assign({}, origItem);
        if (!_.isEmpty(item.min_sculptor)) {
          let sculptors = item.min_sculptor.split(',');
          let matchSetQuery = _.map(sculptors, (item) => {
            return `sculptor_id=${item.trim()}`
          }, '').join('||');

          item.min_sculptor = query(`data.sculptors.min_sculptors[*${matchSetQuery}]`, {
            data: {
              data
            }
          }).value
        }
        if (!_.isEmpty(item.min_artist)) {
          let artists = item.min_artist.split(',');
          let matchSetQuery = _.map(artists, (item) => {
            return `artist_id=${item.trim()}`
          }, '').join('||');

          item.min_artist = query(`data.artists.min_artists[*${matchSetQuery}]`, {
            data: {
              data
            }
          }).value
        }
        if (!_.isEmpty(item.min_sets)) {
          let sets = item.min_sets.split(',');
          let matchSetQuery = _.map(sets, (item) => {
            return `set_id=${item.trim()}`
          }, '').join('||');

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
        }).value;
        console.log(item);
        return item;
      })
    }
  };
  let queryString = `minis[*min_id=${search}||min_name~/${search}/i]:expand(?)`;
  let match = query(queryString, {
    data: data.minis,
    locals: helpers,
    allowRegexp: true
  });
  return match.value
}
/*
function createStatusList(items, joiner) {
  let ret = {
    count: 0,
    strng: ""
  };
  items = items.split(',');
  items.forEach( function(e) {
    let en = parseInt(e);
    ret.count++;
    //ret.strng = ret.strng + dataStatus.min_status[en].status;
    ret.strng = ret.strng + data.status.min_status[en].status; //new
    if (items.length != ret.count) {
      ret.strng = ret.strng + joiner;
    }
  });
  return ret;
}
/*
function createArtistList(items, joiner, grabUrl) {
  let ret = {
    count: 0,
    strng: ""
  };
  items = items.split(',');
  items.forEach( function(e) {
    let en = parseInt(e);
    ret.count++;
    ret.strng = ret.strng + data.artists.min_artists[en].artist_name;
    if (grabUrl) {
      if (data.artists.min_artists[en].artist_url != "") {
        ret.strng = ret.strng + " [ " + data.artists.min_artists[en].artist_url + " ]";
      }
    }
    if (items.length != ret.count) {
      ret.strng = ret.strng + joiner;
    }
  });
  return ret;
}
*/
function createArtistList(items, joiner, grabUrl) {
  let ret = {
    count: 0,
    strng: ""
  };
  if (items.length == 0) {
    ret.count = 0;
    ret.strng = "\n  The concept artist for this miniature is unknown.";
    return ret;
  }
  if (items[0].artist_name == "Unknown") {
    ret.count = 0;
    ret.strng = "\n  The concept artist for this miniature is unknown.";
    return ret;
  }
  items.forEach( function(i) {
    ret.count++;
    ret.strng = ret.strng + i.artist_name;
    if (grabUrl && (i.artist_url != "")) {
      ret.strng = ret.strng + " [ " + i.artist_url + " ]";
    }
    if (items.length != ret.count) {
      ret.strng = ret.strng + joiner;
    }
  });
  if (ret.count == 1) {
    ret.strng = "\n  Artist:  " + ret.strng;
  } else {
    ret.strng = "\n  Artists:  " + ret.strng;
  }
  return ret;
}
/*
function createSculptorList(items, joiner, grabUrl) {
  let ret = {
    count: 0,
    strng: ""
  };
  items = items.split(',');
  items.forEach( function(e) {
    let en = parseInt(e);
    ret.count++;
    ret.strng = ret.strng + data.sculptors.min_sculptors[en].sculptor_name;
    if (grabUrl) {
      if (data.sculptors.min_sculptors[en].sculptor_url != "") {
        ret.strng = ret.strng + " [ " + data.sculptors.min_sculptors[en].sculptor_url + " ]";
      }
    }
    if (items.length != ret.count) {
      ret.strng = ret.strng + joiner;
    }
  });
  return ret;
}*/
function createSculptorList(items, joiner, grabUrl) {
  let ret = {
    count: 0,
    strng: ""
  };
  if (items.length == 0) {
    ret.count = 0;
    ret.strng = "\n  The sculptor of this miniature is unknown.";
    return ret;
  }
  if (items[0].sculptor_name == "Unknown") {
    ret.count = 0;
    ret.strng = "\n  The sculptor of this miniature is unknown.";
    return ret;
  }
  items.forEach( function(i) {
    ret.count++;
    ret.strng = ret.strng + i.sculptor_name;
    if (grabUrl && (i.sculptor_url != "")) {
      ret.strng = ret.strng + " [ " + i.sculptor_url + " ]";
    }
    if (items.length != ret.count) {
      ret.strng = ret.strng + joiner;
    }
  });
  if (ret.count == 1) {
    ret.strng = "\n  Sculptor:  " + ret.strng;
  } else {
    ret.strng = "\n  Sculptors:  " + ret.strng;
  }
  return ret;
}

function showMiniInfo(say, subcmd, fullcmd) {
  let parsed = parseCommand(fullcmd);
  let tmp = '';
  let tmp2;
  if (parsed.scmd == "help") {
    tmp = "To use the mini database, enter\n!mini [subcommand] [miniature]\n\n[subcommand] can be any one of the following: help, summary, sculptor, artist, status, firstsold, gameplay, notes, lore, art, pictures, buildguide, sets\n\nIf no [subcommand] is given, then 'summary' will be assumed.\n\n[miniature] is the name of the miniature.";
    say(tmp);
    return;
  }
  let entry;
  /*
  if (parsed.isId) {
    entry = _.find(dataMinis.minis, function (a) {
      return ~~a.id === ~~parsed.srch
    })
  } else {
    entry = _.find(dataMinis.minis, function (a) {
      return _.lowerCase(a.min_name) === parsed.srch
    })
  }
  */
  //from here to mark is all new
  let entries = joinMiniData(parsed.srch);
  if (entries.length > 1) {
    say(`Found ${entries.length} entries`);
    entries.map(function(entry) {
      say(`Id ${entry.min_id} - ${entry.min_name}`)
    })
  } else {
    _.forEach(entries, (entry) => {
      //mark

      if (entry) {

        switch (parsed.scmd) {
          case "help":
            say("Daisy, Daisy, give me yoour answeeerrrrrr doooooooooooooo....");
            break;
          case "sum":
          case "info":
          case "summery":
          case "summary":
          case "information":
            if (entry.min_summary != "") {
              tmp = entry.min_name + "\n  Summary:  " + entry.min_summary;
            } else {
              tmp = entry.min_name + "\n  There is no summary for this miniature.";
            }
            say(tmp);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' lore ' + parsed.srch)
            });
            break;
          case "lore":
            if (entry.min_lore != "") {
              tmp = entry.min_name + "\n  Lore:  " + entry.min_lore;
              say("Lore for " + entry.min_name + " whispered due to potential spoilers.");
              say(tmp, 'user')
            } else {
              tmp = entry.min_name + "\n  There is no lore for this miniature.";
              say("Lore for " + entry.min_name + " whispered due to potential spoilers.");
              say(tmp, 'user')
            }
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' sculptor ' + parsed.srch)
            });
            break;
          case "sculpt":
          case "sculpter":
          case "sculptor":
            tmp2 = createSculptorList(entry.min_sculptor, ", ", true);
            if (tmp2.count <= 1) {
              tmp = entry.min_name + tmp2.strng;
            } else {
              tmp = entry.min_name + tmp2.strng;
            }
            say(tmp);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' artist ' + parsed.srch)
            });
            break;
          case "artist":
          case "conceptartist":
            tmp2 = createArtistList(entry.min_artist, ", ", true);
            if (tmp2.count <= 1) {
              tmp = entry.min_name + tmp2.strng;
            } else {
              tmp = entry.min_name + tmp2.strng;
            }
            /*
             tmp = entry.min_name + "\n  Artist:  " + dataArtists.min_artists[entry.min_artist].artist_name;
             if (dataArtists.min_artists[entry.min_artist].artist_url != "") {
             tmp = tmp + "\n  Url: " + dataArtists.min_artists[entry.min_artist].artist_url;
             } */
            say(tmp);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' notes ' + parsed.srch)
            });
            break;
          case "note":
          case "notes":
            if (entry.min_notes != "") {
              tmp = entry.min_name + "\n  Notes:  " + entry.min_notes;
            } else {
              tmp = entry.min_name + "\n  There are no notes for this miniature.";
            }
            say(tmp);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' art ' + parsed.srch)
            });
            break;
          case "art":
          case "artwork":
          case "concept":
          case "conceptart":
            if (entry.min_artwork != "") {
              tmp = entry.min_name + "\n  Artwork:  " + entry.min_artwork;
            } else {
              tmp = entry.min_name + "\n  There is no artwork for this miniature available.";
            }
            say(tmp);
            miniatures.tempMatch('more', () => {
              showMiniInfo(undefined, parsed.cmd + ' pic ' + parsed.srch)
            });
            break;
          case "pic":
          case "picture":
          case "pictures":
            if (entry.min_pictures != "") {
              tmp = entry.min_name + "\n  Pictures:  " + entry.min_pictures;
            } else {
              tmp = entry.min_name + "\n  There are no pictures of this miniature available.";
            }
            say(tmp);
            break;
          case "guide":
          case "build":
          case "buildguide":
            if (entry.min_buildguide != "") {
              tmp = entry.min_name + "\n  Build Guide:  " + entry.min_buildguide;
            } else {
              tmp = entry.min_name + "\n  There is no build guide for this miniature available.";
            }
            say(tmp);
            break;
          case "game":
          case "gameplay":
            if (entry.min_gameplay == "TRUE") {
              tmp = entry.min_name + "\n  There is gameplay associated with this miniature.";
            } else {
              tmp = entry.min_name + "\n  There is no gameplay associated with this miniature at this time.";
            }
            say(tmp);
            break;
          case "stat":
          case "status":
            if (entry.min_status.id == "0") {
              tmp = entry.min_name + "\n  This miniature's status is unknown.";
            } else {
              tmp = entry.min_name + "\n  This miniature has been " + entry.min_status.status + ".";
            }
            say(tmp);
            break;
          case "sold":
          case "first":
          case "firstsold":
            if (entry.min_firstsold == "") {
              //this is messy and could break later
              if (entry.min_status.id == "2") {
                tmp = entry.min_name + "\n  It is unknown when this miniature first sold.";
              } else {
                tmp = entry.min_name + "\n  This mini has not been available for public sale yet.";
              }
            } else {
              tmp = entry.min_name + "\n  This miniature was first sold on " + entry.min_firstsold + ".";
            }
            say(tmp);
            break;
          default:
            say(entry.min_name + "\n  Yeah, it exists. What of it? :p");
        }
        // set|sets, all (mebbe list, search?)
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

function minis(match, say) {
  //match(['miniinfo', 'mininfo', 'mini', 'min'], showMiniInfo);
  match(['miniinfo', 'mininfo', 'mini', 'min'], _.curry(showMiniInfo)(say));
  match(['minirefresh', 'minrefresh'], init);
}

minis.prototype.init = init;
module.exports = minis;
