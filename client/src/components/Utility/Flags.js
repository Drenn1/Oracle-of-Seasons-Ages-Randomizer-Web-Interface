const flags = [
  ["hard", "Hard Difficulty", "Requires more advanced knowledge and techniques concerning travel, alternate means of damagings enemies, getting seeds from locations other than trees, etc."],
  ["crossitems", "Cross-Items", "Include Ages items in Seasons, and vice-versa."],
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
