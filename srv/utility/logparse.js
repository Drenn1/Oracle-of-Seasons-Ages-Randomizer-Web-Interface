const fs = require('fs');
const oosLocs = require('./spoiler/oos.json')
const ooaLocs = require('./spoiler/ooa.json')

function parseLog(logFile, game){
  const locBase = require(`./spoiler/${game}.json`)
  const itemObj = {items: {}}
  const retObj = {playthrough: []}
  const lines = logFile.split('\r\n');

  let progress = true;
  let state = 'items'
  let sphere = [];

  function pushSphere(){
    // Need to map now as pushing sphere would push a reference, and pops will remove items that are wanted to be stored;
    const newSphere = sphere.map(item=>item)
    retObj.playthrough.push(newSphere);
    sphere = [];
  }

  lines.forEach(line => {
    if (line.indexOf(' <-') > -1){
      const location = line.split(' <-').map(item=>item.trim());
      const name = location[0].replace('.', '');
      if (state !== 'items'){
        retObj[state][name] = location[1];
      } else {
        itemObj[name] = location[1];
      }
      if (progress === true) {
        const locObj = {};
        locObj[name] = location[1];
        sphere.push(locObj)
      }
    } else if (line.indexOf('-- small keys') > -1){
      pushSphere();
      progress = false;
    } else if (line.indexOf('sphere ') > -1 && sphere.length > 0) {
      pushSphere();
    } else if (line.indexOf('-- dungeon entrances') > -1) {
      state = 'dungeons';
      retObj[state] = {}
    } else if (line.indexOf('-- subrosia portals') > -1) {
      state = 'portals';
      retObj[state] = {}
    } else if (line.indexOf('-- default seasons') > -1) {
      state = 'seasons';
      retObj[state] = {}
    }
  })

  Object.keys(locBase).forEach(area => {
    retObj[area] = {}
    Object.keys(locBase[area]).forEach(locName => {
      retObj[area][locName] = itemObj[locName];
    })
  })

  return retObj
}

module.exports = parseLog;