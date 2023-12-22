const flags = [
  ["hard", "Hard Difficulty", "Requires more advanced knowledge and techniques concerning travel, alternate means of damagings enemies, getting seeds from locations other than trees, etc."],
  ["treewarp", "Tree Warp", "From an overworld location, warp to the main town's seed tree by opening the map, then hold start while closing the map. Does not affect item placement logic."],
  ["dungeons", "Shuffle Dungeons", "Dungeon entrance shuffle. No other entrances are shuffled."],
  ["portals", "Shuffle Portals", "Shuffle which portal in Holodrom leads to which portal in Subrosia."],
]

export default function(game){
  const sentFlags = flags.map(flag=>flag); // Make a copy so main const doesn't get edited
  if (game === "Ages" || game === "ooa"){
    sentFlags.pop();
  }
  return sentFlags
}