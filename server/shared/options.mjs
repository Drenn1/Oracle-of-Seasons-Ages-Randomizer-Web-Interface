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
    name: "Dungeon Shuffle",
    desc: "Dungeon entrance shuffle. No other entrances are shuffled."
  },
  "portals": {
    name: "Portal Shuffle",
    desc: "Shuffle which portal in Holodrum leads to which portal in Subrosia.",
    game: "oos"
  },
  "hard": {
    name: "Hard Logic",
    desc: "Only recommended for speedrunners. Requires more advanced knowledge and techniques concerning travel, alternate means of damagings enemies, getting seeds from locations other than trees, etc."
  },
  "music": {
    name: "Music Shuffle",
    desc: "Shuffle music tracks. 'on'=shuffle normally, 'all'=include custom music tracks.",
    type: "combo",
    values: ["off", "on", "all"],
  },
};

  // Get the object containing the list of options, optional parameter for game
function getConfig(game) {
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
  return sentOptions;
};

export default getConfig;
