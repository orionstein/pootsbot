let request = require('request');
let cheerio = require('cheerio');
let _ = require('lodash');
let async = require('async');


module.exports = function(match, say) {
  let defaultResponse = "lore";
  let dataMinis;
  let latestUpdatedMinis;

  function pullDataMinis(cb) {
    if (!dataMinis) {
      request({
        url: 'http://www.rubidiumhexafluorosilicate.com/kd/kingdomdeath.json',
        json: true
      }, function(error, res, body) {
        if (!error) {
          dataMinis = body;
          latestUpdatedMinis = res.headers['last-modified'];
          cb(body)
        }
      });
    } else {
      request({
        url: 'http://www.rubidiumhexafluorosilicate.com/kd/kingdomdeath.json',
        method: 'HEAD'
      }, function(error, res) {
        if (latestUpdatedMinis === res.headers['last-modified']) {
          cb(dataMinis)
        } else {
          dataMinis = void 0;
          pullDataMinis(cb)
        }
      });
    }
  }

  match(['miniinfo', 'mini'], function(srch, command) {
    let search = "";
    let stype = defaultResponse; // what type of data are we hunting for?
    let parser = command.split(' ');
    parser[2] = parser.slice(2).join(' ');
    if (parser.length <= 1) {
      // only gave command ... ignore this stuff. :P
      say("Whachoo tryin' to say, Willis?");
      return false;
    }
    if (parser.length == 2) {
      // okay, we have command and search item (default subcommand) OR command and subcommand (no search item)
      // assume first a search item
      search = parser[1].toLowerCase();
      // check to see if it's a subcommand, and if so, move it there, and then blank the search term
      if (search.match("lore|sum|summery|summary|sculpt|sculpter|sculptor|artist|note|notes|art|artwork|pic|picture|pictures")) {
        stype = search;
        search = "";
      }
    } else {
      // we got both command, subcommand and search item OR command and multiword search item (default subcommand)
      // assume first subcommand/search
      stype = parser[1].toLowerCase();
      search = parser[2].toLowerCase();
      // check to see if stype actually is a subcommand, else it must be multi-word search item \
      if (!stype.match("lore|sum|summery|summary|sculpt|sculpter|sculptor|artist|note|notes|art|artwork|pic|picture|pictures")) {
        search = stype + " " + search;
        stype = defaultResponse;
      }
    }

    let isnum = /^\d+$/.test(search);

    pullDataMinis(function(body) {
      let entry;
      if (isnum) {
        entry = _.find(body.miniatures, function(a) {
          return ~~a.id === ~~search
        })
      } else {
        entry = _.find(body.miniatures, function(a) {
          return _.lowerCase(a.min_name) === _.lowerCase(search)
        })
      }
      if (entry) {
        switch (stype) {
          case "sum":
          case "summ":
          case "summery":
          case "summary":
            say(entry.min_name + "\n  Summary:  " + entry.min_lore);
            break;
          case "lore":
            say(entry.min_name + "\n  Lore:  " + entry.min_lore);
            break;
          case "sculpt":
          case "sculpter":
          case "sculptor":
            say(entry.min_name + "\n  Sculptor:  " + entry.min_sculptor);
            break;
          case "artist":
            say(entry.min_name + "\n  Artist:  " + entry.min_artist);
            break;
          case "note":
          case "notes":
            say(entry.min_name + "\n  Notes:  " + entry.min_notes);
            break;
          case "art":
          case "artwork":
            say(entry.min_name + "\n  Artwork:  " + entry.min_artwork);
            break;
          case "pic":
          case "picture":
          case "pictures":
            say(entry.min_name + "\n  Pictures:  " + entry.min_pictures);
            break;
          default:
            say(entry.min_name + "\n  Yeah, it exists. What of it? :p");
        }
      } else {
        if (isnum) {
          say("There is no miniature with index #" + search + " was not found.");
        } else {
          say("The miniature '" + search + "' was not found.");
        }

      }
    });
  })

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

}
