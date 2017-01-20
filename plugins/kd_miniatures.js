let request = require('request');
let cheerio = require('cheerio');
let _ = require('lodash');
let async = require('async');
let store = require('../utils/store');
let miniatures = store.createNameSpace('miniatures');
let query = require('json-query');

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
let data = {};let latestUpdateMinis;
let latestUpdateArtists;
let latestUpdateSculptors;
let latestUpdateSets;
let latestUpdateStatus;
let defaultResponse = "summary";

/*
These following functions handle pulling in the various jsons into the data variable.  They do so only once on bot startup
or if the bot is asked specifically to refresh the data
 */
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
        cb(data.minis);
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
        cb(data.artists);
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
        cb(data.sculptors);
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
        cb(data.sets);
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
        cb(data.status);
      } else {
        data.status = void 0;
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

/*
The initializer... currently just checks and grabs json data if needed.
 */
const init = (bot) => {
  alreadyPulledData = false;
  isDataLoaded();
};

/*
This function takes in the full command given to the bot (!min [subcommand] [miniature]) and parses it into each item, which is
returned.
The return object includes the three parts of the full command (the command, subcommand, and search item) as well as setting isId true
if the search item is a number (and thus used for index # lookups), and if it is a literal search (meaning match exactly, since
the search term was enclosed in either single- or double-quotes)
 */
function parseCommand(subcmd) {
  let parsed = {
    scmd: defaultResponse,
    srch: '',
    lsrch: '',
    isId: false,
    isLit: false
  };
  if (!subcmd) {
    parsed.scmd = "help";
    return parsed;
  }
  subcmd = (subcmd.replace( /[\s\n\r]+/g, ' ' )).trim();
  let parser = subcmd.split(' ');
  if (parser.length == 0) {
    parsed.scmd = 'help';
    return parsed;
  }
  if (parser[0].match(cmds)) {
    if (parser.length >= 2) {
      parser[1] = parser.slice(1).join(' ');
    } else {
      parser[1] = "";
    }
  } else {
    if (parser.length >=1) {
      parser[1] = parser.slice(0).join(' ');
      parser[0] = defaultResponse;
    }
  }
  parsed.scmd = parser[0].toLowerCase();
  parsed.srch = parser[1].toLowerCase();
  parsed.lsrch = parsed.srch;
  if((parsed.srch[0] == "'" && parsed.srch[parsed.srch.length - 1] == "'") || (parsed.srch[0] == '"' && parsed.srch[parsed.srch.length - 1] == '"') ){
    parsed.isLit = true;
    parsed.srch = parsed.srch.substr(1,parsed.srch.length - 2);
  }
  parsed.isId = /^\d+$/.test(parsed.srch);
  if(parsed.srch == "") {
    parsed.srch = parsed.scmd;
    parsed.scmd = "help";
  }
  return parsed
}

function joinMiniData(search, isLit, isId) {
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
  let ret = [];
  let queryString = '';
  /*
   //when attempted to deal with isLit, to pull just one exact match, i get returns in form of object, which don't expand nicely, or other issues with returned data
   //in other words, trying to handle it through queryString is just blowing up in my face and not worth time to fix via this method
  if (isLit) {
    queryString = `minis[min_name~/^${search}$/i:expand(?)`;
  } else {
    queryString = `minis[*min_id=${search}||min_name~/${search}/i]:expand(?)`;
  } // `minis[*min_id=${search}||min_name~/${search}/i]:expand(?)`;
  */
  queryString = `minis[*min_id=${search}||min_name~/${search}/i]:expand(?)`;
  let match = query(queryString, {
    data: data.minis,
    locals: helpers,
    allowRegexp: true
  });
  // as i've seen returns come back as object rather than array, which blows up stuff other places in code, sanity check here:
  if (Array.isArray(match.value)) {
    ret = match.value;
  } else {
    ret[0] = match.value;
  }
  //so instead of handling isLit in the actual search, i'll have to kludge and strip out all non-exact-matches here:
  if (isLit) {
    let tmp = [];
    _.forEach(ret, (retItem) => {
      if(retItem) {
        if(!isId) {
          if(retItem.min_name.toLowerCase() == search) {
            tmp[0] = retItem;
          }
        } else {
          if(retItem.min_id == search) {
            tmp[0] = retItem;
          }
        }
      }
    })
    ret = tmp;
  }
  return ret;
}

/*
The following functions expect an array of either artists or sculptors, and join them with the joiner.  grabUrl is a
boolean determining whether or not to also return the person's website.
It returns an object including both the number of people in the list (so singular/plural can be determined) and the string
containing names and possibly urls.
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

/*
This just handles the various help responses
 */
function handleHelp(item) {
  switch (item) {
    case "sum":
    case "info":
    case "summery":
    case "summary":
    case "information":
      return "To use this command, use the format !mini summary [miniature] OR !mini [miniature]\n\n" +
        "This will return a summary about the miniature.";
      break;
    case "lore":
      return "To use this command, use the format !mini lore [miniature]\n\n" +
        "This will return any lore associated with the miniature.  Note that lore will be whispered back to you, as it could be considered a spoiler.";
      break;
    case "sculpt":
    case "sculpter":
    case "sculptor":
    case "sculpters":
    case "sculptors":
      return "To use this command, use the format !mini sculptor [miniature]\n\n" +
        "This will return the sculptor or sculptors of the miniature, if known.";
      break;
    case "artist":
    case "artists":
    case "conceptartist":
      return "To use this command, use the format !mini artist [miniature]\n\n" +
        "This will return the artist or artists responsible for the concept art for the miniature, if known.";
      break;
    case "note":
    case "notes":
      return "To use this command, use the format !mini notes [miniature]\n\n" +
        "This will return any notes about the miniature.";
      break;
    case "art":
    case "artwork":
    case "concept":
    case "conceptart":
      return "To use this command, use the format !mini art [miniature]\n\n" +
        "This will return the URL of the concept art for the miniature, often used for the art cards included with some miniatures.";
      break;
    case "pic":
    case "picture":
    case "pictures":
      return "To use this command, use the format !mini pictures [miniature]\n\n" +
        "This will return the URL of pictures of the miniature.";
      break;
    case "guide":
    case "build":
    case "buildguide":
      return "To use this command, use the format !mini buildguide [miniature]\n\n" +
        "If one is available, this will return the URL of a build guide for this miniature.";
      break;
    case "game":
    case "gameplay":
      return "To use this command, use the format !mini gameplay [miniature]\n\n" +
        "This will return whether or not the miniature has any Kingdom Death: Monster gameplay associated with it, as opposed to just being a collectible miniature.";
      break;
    case "stat":
    case "status":
      return "To use this command, use the format !mini status [miniature]\n\n" +
        "This will return whether the mini has been released, or merely announced (but not released yet).";
      break;
    case "sold":
    case "first":
    case "firstsold":
      return "To use this command, use the format !mini firstsold [miniature]\n\n" +
        "This will return the date the miniature was first sold publicly.";
      break;
    default:
      return "To use the mini database, enter\n" +
        "!mini [subcommand] [miniature]\n\n" +
        "[subcommand] can be any one of the following: help, summary, sculptor, artist, status, firstsold, gameplay, notes, lore, art, pictures, buildguide, sets\n\n" +
        "If no [subcommand] is given, then 'summary' will be assumed.\n\n" +
        "[miniature] is the name of the miniature. If quoted, then the search will only return an exact match.";
  }
  return "Daisy, Daisy, give me yoour answeeerrrrrr doooooooooooooo....";
}
/*
This is the meat of the program, and handles responding to the questioner with an appropriate answer.
 */
function showMiniInfo(say, subcmd) {
  let parsed = parseCommand(subcmd);
  let tmp = '';
  let tmp2;
  if (parsed.scmd == "help") {
    say(handleHelp(parsed.srch));
    return;
  }
  let entries = joinMiniData(parsed.srch, parsed.isLit, parsed.isId);
  if (entries.length == 0) {
    if (parsed.isId) {
      say("There is no miniature with index #" + parsed.srch + ".");
    } else {
      say("The miniature '" + parsed.srch + "' was not found.");
    }
    return;
  }
  if (entries.length > 1) {
    if (entries.length <= 10) {
      say(`There are ${entries.length} miniatures that match that search:`);
      entries.map(function(entry) {
        say(`Id ${entry.min_id} - ${entry.min_name}`)
      })
      /*
       function paging(start=0, numItems=10, search){
       let miniInfo = joinMiniData(search);
        let slice = miniInfo.slice(start, start+numItems);
         _.foreach(slice, (item) => {
         say('item blah') };
          return tempMatch('more', _.curry(paging(start+10, numItems)) } paging(0, 15, search)
       */
    } else {
      say(`There are ${entries.length} miniatures that match that search.  I will list them in groups:`);
      function paging(start=0, numItems=10, search) {
        let miniInfo = joinMiniData(search, false, false);
        let slice = miniInfo.slice(start, start+numItems);
        _.forEach(slice, (item) => {
          say(`Id ${item.min_id} - ${item.min_name}`);
        });
        let tmp = (miniInfo.length - (start+10)) - numItems;
        if (tmp < (numItems * -1)) { return; }
        if (tmp < 0) {
          let temp = numItems + tmp;
          say('Enter !more for the next group of ' + temp.toString() + '.');
        } else {
          say('Enter !more for the next group of ' + numItems.toString() + '.');
        }
        miniatures.tempMatch('more', () => {
          paging(start+10,numItems,search)
        });
      }
      paging (0, 10, parsed.srch);
    }
    /*
     miniatures.tempMatch('more', () => {
     showMiniInfo(say, 'pic ' + parsed.lsrch)
     });
     */
  } else {
    _.forEach(entries, (entry) => {
      switch (parsed.scmd) {
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
            showMiniInfo(say, 'lore ' + parsed.lsrch)
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
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'info ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'sculptor ' + parsed.lsrch)
          });
          break;
        case "sculpt":
        case "sculpter":
        case "sculptor":
        case "sculpters":
        case "sculptors":
          tmp2 = createSculptorList(entry.min_sculptor, ", ", true);
          if (tmp2.count <= 1) {
            tmp = entry.min_name + tmp2.strng;
          } else {
            tmp = entry.min_name + tmp2.strng;
          }
          say(tmp);
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'lore ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'artist ' + parsed.lsrch)
          });
          break;
        case "artist":
        case "artists":
        case "conceptartist":
          tmp2 = createArtistList(entry.min_artist, ", ", true);
          if (tmp2.count <= 1) {
            tmp = entry.min_name + tmp2.strng;
          } else {
            tmp = entry.min_name + tmp2.strng;
          }
          say(tmp);
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'sculptor ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'notes ' + parsed.lsrch)
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
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'artist ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'art ' + parsed.lsrch)
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
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'notes ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'pic ' + parsed.lsrch)
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
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'art ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'buildguide ' + parsed.lsrch)
          });
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
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'pic ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'gameplay ' + parsed.lsrch)
          });
          break;
        case "game":
        case "gameplay":
          if (entry.min_gameplay == "TRUE") {
            tmp = entry.min_name + "\n  There is gameplay associated with this miniature.";
          } else {
            tmp = entry.min_name + "\n  There is no gameplay associated with this miniature at this time.";
          }
          say(tmp);
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'buildguide ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'status ' + parsed.lsrch)
          });
          break;
        case "stat":
        case "status":
          if (entry.min_status.id == "0") {
            tmp = entry.min_name + "\n  This miniature's status is unknown.";
          } else {
            tmp = entry.min_name + "\n  This miniature has been " + entry.min_status.status + ".";
          }
          say(tmp);
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, 'gameplay ' + parsed.lsrch)
          //});
          miniatures.tempMatch('more', () => {
            showMiniInfo(say, 'firstsold ' + parsed.lsrch)
          });
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
          //miniatures.tempMatch('prev', () => {
          //  showMiniInfo(say, undefined, 'status ' + parsed.lsrch)
          //});
          break;
        default:
          say(entry.min_name + "\n  Yeah, it exists. What of it? :p");
      }
      // set|sets, all (mebbe list, search?)
    })
  }
}

function minis(match, say) {
  match(['miniinfo', 'mininfo', 'mini', 'min'], _.curry(showMiniInfo)(say));
  match(['minirefresh', 'minrefresh'], init);
}

minis.prototype.init = init;
module.exports = minis;
