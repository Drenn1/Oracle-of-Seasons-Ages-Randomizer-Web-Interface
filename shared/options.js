// This file is used by both the server (node.js) and in the browser.

const optionList = {
  "crossitems": {
    name: "Cross-Items",
    desc: "Include Ages items in Seasons, and vice-versa."
  },
  "keysanity": {
    name: "Keysanity",
    desc: "Dungeon keys, maps, compasses, and slates can be placed anywhere."
  },
  "dungeons": {
    name: "Shuffle Dungeons",
    desc: "Dungeon entrance shuffle. No other entrances are shuffled."
  },
  "portals": {
    name: "Shuffle Portals",
    desc: "Shuffle which portal in Holodrum leads to which portal in Subrosia.",
    game: "oos"
  },
  "hard": {
    name: "Hard Logic",
    desc: "Only recommended for speedrunners. Requires more advanced knowledge and techniques concerning travel, alternate means of damagings enemies, getting seeds from locations other than trees, etc."
  },
};

(function(exports){

  // Get the object containing the list of options, optional parameter for game
  exports.get = function(game){
    // Clone the option list
    const sentOptions = {};
    Object.assign(sentOptions, optionList);

    if (game === "Ages" || game === "ooa"){
      game = "ooa";
    }
    else if (game === "Seasons" || game === "oos") {
      game = "oos";
    }
    else {
      game = "both";
    }

    // Filter out options not belonging to this game
    if (game !== "both") {
      for (const k of Object.keys(optionList).filter(
        k => Object.hasOwn(optionList[k], "game") && optionList[k].game !== game)) {
        delete sentOptions[k];
      }
    }
    return sentOptions
  };

})(typeof exports === 'undefined'? this['options']={}: exports);
