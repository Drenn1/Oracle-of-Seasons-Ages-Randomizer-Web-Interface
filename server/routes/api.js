const express = require('express');
const router = express.Router();
const exec = require('child_process').execFile;
const fs = require('fs');

// For encoding the seed string, returns original seed data if module not found (module not added to git)
let seedHelper
try{
  seedHelper = require('../seedhelper/seedhelper');
}
catch(err){
  seedHelper = function(inputLine){return inputLine;};
}




const OOS = require('../models/OOSSeed');
const OOA = require('../models/OOASeed');
const logParse = require('../utility/logparse');

const version = require('../base/version');
const argsBase = ['-hard', '-treewarp', '-dungeons', '-portals'];

const randoRoot = '../oracles-randomizer-ng/'

function saveSeed(res, game, seedBase, romFile, files) {
  let seedCollection = game === 'oos' ? OOS : OOA;
  const baseRomName = game === 'oos' ? 'seasons' : 'ages';
  const rom = fs.readFileSync(romFile);
  const origRom = fs.readFileSync(randoRoot + `oracles-disasm/${baseRomName}.gbc`);

  const seedData = []

  // Read changed data (TODO: make more efficient? Could have the
  // randomizer output an IPS patch or something instead of checking
  // every single byte in the ROM)
  console.assert(rom.length == origRom.length);
  for (let i=0; i<rom.length; i++) {
    if (origRom.readUInt8(i) != rom.readUInt8(i)) {
      bytePatch = {};
      bytePatch.offset = i;
      bytePatch.data = rom.readUInt8(i);
      seedData.push(bytePatch);
    }
  }

  const newSeed = new seedCollection(seedBase);
  newSeed.patchData = seedData;

  newSeed.save().then( saved => {
    // Remove generated files and free some space
    files.forEach(file => fs.unlinkSync(file))
    console.log("patch created");
    return res.send(`/${game}/${newSeed.seed}`);
  });
}

router.get('/version', (req, res)=>{
  res.json({version: version})
});

router.post('/randomize', (req,res)=>{
  /*
  * Expects from req.body:
  *   game:          'oos' or 'ooa'  (just append ".blob" to get file to pass into randomizer)
  *   hardMode:      Boolean
  *   treeWarp:      Boolean
  *   dungeons:      Boolean
  *   portals:       Boolean
  *   race:          Boolean
  * 
  * 
  * Optional parameters:
  *   unlockCode:   String
  *   unlockTimeout:   Number
  * Returns a String containing the url for the seed page
  */
  const game = req.body.game;
  if (game !== 'oos' && game !== 'ooa') {
    return res.status(400).json({"nogame": "A valid game was not selected"});
  }
  const randoName = process.env.OS == "Windows_NT" ? "oracles-randomizer-ng.exe" : "oracles-randomizer-ng";
  const randoExec = randoRoot + randoName;
  const baseRomName = game === 'oos' ? 'seasons' : 'ages';
  const gameFile = randoRoot + `oracles-disasm/${baseRomName}.gbc`
  const argsArray = [req.body.hardMode || false, req.body.treeWarp || false, req.body.dungeons || false, req.body.portals || false]
  const execArgs = argsBase.filter((arg, i) => {return argsArray[i]});
  const pass1 = execArgs.map(arg => arg);
  // No log created with race flag. Create 1 pass normally to get a log file, then second pass add race and plan
  pass1.push('-noui', gameFile);
  exec(randoExec, pass1, (err, out, stderr) => {
    if (err) {
      console.log("error");
      console.log(err);
      return res.send(err);      
    } else {      
      // Should be array of [rom , log]
      const files = out.toString().split('\n').filter(line => line.includes(version))
      // Get just the filename out of the strings
      const romFile =   files[0].split(' ').filter(word => word.includes(version))[0] 
      const logFile =   files[1].split(' ').filter(word => word.includes(version))[0]
      const dataFiles = [romFile, logFile];

      // Breaks the filename into different segments [base, version, seed] and then remove flag chars
      const seed = romFile.split('_')[2].split('-')[0]
      const args = execArgs.join('$');
      const encodedSeed = seedHelper(`${seed}_${game}_${version}_${args}`);
      const logFileData = fs.readFileSync(logFile, {encoding: 'utf8'});
      const parsedLog = logParse(logFileData, game);
      // const stringified = JSON.stringify(parsedLog);
      const newSeedBase = {
        seed: encodedSeed,
        baseSeed: seed,
        hard: argsArray[0],
        treewarp: argsArray[1],
        dungeons: argsArray[2],
        spoiler: parsedLog,
        locked: req.body.race || false,
        genTime: Math.floor((new Date).valueOf()/1000)
      }
      if (req.body.race){
        newSeedBase.unlockCode = req.body.unlockCode;
        newSeedBase.timeout = req.body.unlockTimeout;
      }
      
      if (game === 'oos') {
        newSeedBase.portals = argsArray[3];
      }

      // If race, use plan to make the race rom so seed info isn't shown
      if (newSeedBase.locked){
        execArgs.push('-plan', logFile, '-race', '-noui', gameFile);
        exec(randoExec, execArgs, (err2, out2, stderr) => {
          if (err2) {
            console.log("error");
            console.log(err2);
            return res.send(err2);      
          } else {
            // Should be array of [rom , log]
            const files2 = out2.toString().split('\n').filter(line => line.includes(version));
            // Get just the filename out of the strings
            const raceFile =   files2[0].split(' ').filter(word => word.includes(version))[0];
            dataFiles.push(raceFile)
            saveSeed(res, game, newSeedBase, raceFile, dataFiles)
          }
        });
      } else {
        saveSeed(res, game, newSeedBase, romFile, dataFiles)
      }
    }
  });
});

router.get('/:game/:id', (req,res)=>{
  /*
  * Ignores everything from req.body
  * 
  * :game should be equal to 'oos' or 'ooa' else it returns an error
  * 
  * :id is the encoded seed id
  * 
  * Returns an Object with the following keys:
  *   patch: Array of {offset: patch data} objects
  *   version: String indicating version of randomizer used
  *   hard: Boolean indicating if hard mode was enabled
  *   treewarp: Boolean indicating if treewarp was enabled
  *   dungeons: Boolean indicating if dungeon shuffle was enabled
  *   portals: Boolean indicating if subrosia portal was enabled
  *   locked: Boolean if spoiler is available
  *   spoiler: Empty Object if locked, or Object containing spoiler data
  *   genTime: Timestring indicating when rom was made
  *   timeout: Number of seconds spoiler to remain locked from genTime
  *   unlockTime: Timestring indicating when seed got unlocked   
  *   
  */

  const game = req.params.game;
  let seedCollection;
  switch (game){
    case "ooa":
      seedCollection = OOA;
      break;
    case "oos":
      seedCollection = OOS;
      break
    default:
      res.status(404).send("Seed not found");
  }

  seedCollection.findOne({seed: req.params.id}).then(seed=>{
    if(seed){
      const response = {
        patch: seed.patchData,
        version: version,
        hard: seed.hard,
        treewarp: seed.treewarp,
        dungeons: seed.dungeons,
        locked: seed.locked,
        spoiler: seed.spoiler,
        genTime: seed.genTime,
        timeout: seed.timeout,
        unlockTime: seed.unlockTime,
      }
      if (game === "oos"){
        response.portals = seed.portals
      }

      const curTime = Math.floor((new Date).valueOf()/1000);
      if (response.locked && response.genTime + response.timeout > curTime){
        response.spoiler = {};
      } else {
        response.locked = false;
      }

      res.send(response);
    } else{
      res.send('unable to find seed');
    }
  }).catch(err =>{
    console.log(err)
    res.send('unable to locate');
  })
});

router.put('/:game/:id/:unlock', (req,res)=>{
  /*
  * Ignores everything from req.body
  * 
  * :game should be equal to 'oos' or 'ooa' else it returns an error
  * :id is the encoded seed id
  * :unlock is the code to be used to make the spoiler accessible
  * 
  * Returns an object with the following key:
  *   unlocked: Boolean
  */

  const {game, id, unlock} = req.params;
  let seedCollection;
  switch (game){
    case "ooa":
      seedCollection = OOA;
      break;
    case "oos":
      seedCollection = OOS;
      break
    default:
      res.status(404).send("Seed not found");
  }

  seedCollection.findOne({seed: id}).then(seed=>{
    if(seed){
      if (seed.unlockCode !== unlock){
        res.status(403).json({unlocked: false});
      } else {
        seed.locked = false;
        seed.save().then(saved => res.json({unlocked: true})).catch(err => res.send('error saving'));
      }
    } else{
      res.send('unable to find seed');
    }
  }).catch(err =>{
    console.log(err)
    res.send('unable to locate');
  })
});

module.exports = router;
