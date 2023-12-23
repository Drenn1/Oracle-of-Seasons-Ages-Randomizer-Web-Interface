// This file is used by both the server (node.js) and in the browser.

const optionList = {
  "crossitems": {
    name: "Cross-Items",
    desc: "Include Ages items in Seasons, and vice-versa."
  },
  "dungeons": {
    name: "Shuffle Dungeons",
    desc: "Dungeon entrance shuffle. No other entrances are shuffled."
  },
  "hard": {
    name: "Hard Logic",
    desc: "Requires more advanced knowledge and techniques concerning travel, alternate means of damagings enemies, getting seeds from locations other than trees, etc."
  },
  "portals": {
    name: "Shuffle Portals",
    desc: "Shuffle which portal in Holodrom leads to which portal in Subrosia.",
    game: "oos"
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
