const express = require('express');
const router = express.Router();
const exec = require('child_process').execFile;
const fs = require('fs');
const readline = require('readline');
const YAML = require('yaml')

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
const gb = require('../utility/gb');
const Options = require('../shared/options')

const version = require('../base/version');

const randoRoot = '../oracles-randomizer-ng/';
const baseRomDir = '../roms/';

const basePatches = {
  'ooa': getBasePatch('ooa'),
  'oos': getBasePatch('oos')
};

const baseRandoRom = {
  'ooa': readBaseRandoRom('ooa'),
  'oos': readBaseRandoRom('oos'),
}

const symbolMaps = {
  'ooa': loadSymbols(randoRoot + 'oracles-disasm/ages.gbc'),
  'oos': loadSymbols(randoRoot + 'oracles-disasm/seasons.gbc')
};

function loadSymbols(romFile) {
  const symbolFile = romFile.slice(0, romFile.lastIndexOf('.')) + '.sym';
  const fileContent = fs.readFileSync(symbolFile, 'utf-8');

  var regex = /^([0-9a-f]{2}):([0-9a-f]{4}) (\S+)$/;
  var symbolMap = {};

  for (line of fileContent.split('\n')) {
    if (m = regex.exec(line)) {
      const bank = parseInt(m[1], 16);
      const pointer = parseInt(m[2], 16);
      const name = m[3];

      const addr = gb.ptrToAddr(bank, pointer);
      symbolMap[name] = addr;
    }
  }

  return symbolMap;
}

function readBaseRandoRom(game) {
  const baseRomName = game === 'oos' ? 'seasons' : 'ages';
  return fs.readFileSync(randoRoot + `oracles-disasm/${baseRomName}.gbc`);
}

// Save seed data to database, send response indicating completion
function saveSeed(res, game, seedBase, romFile, files) {
  let seedCollection = game === 'oos' ? OOS : OOA;
  const baseRomName = game === 'oos' ? 'seasons' : 'ages';
  const rom = fs.readFileSync(romFile);
  const origRom = baseRandoRom[game];

  const seedData = new Map();

  // Read changed data (TODO: make more efficient? Could have the
  // randomizer output an IPS patch or something instead of checking
  // every single byte in the ROM)
  console.assert(rom.length == origRom.length);
  for (let i=0; i<rom.length; i++) {
    if (origRom.readUInt8(i) != rom.readUInt8(i)) {
      seedData.set(i.toString(), rom.readUInt8(i).toString());
    }
  }

  const newSeed = new seedCollection(seedBase);
  newSeed.patchData = seedData;

  newSeed.save().then( saved => {
    // Remove generated files and free some space
    files.forEach(file => fs.unlinkSync(file))
    console.log("patch created");
    return res.send(`/${game}/${newSeed.seed}`);
  })
  .catch(err => {
    console.log("Error saving seed to database:")
    console.log(err);
  });
}

// Gets the patch data between a vanilla rom and the disassembly's generated ROM
// (pre-randomized but with all code patches needed for rando).
// This is really inefficient... should use something like BPS instead of
// tracking individual byte changes...
function getBasePatch(game) {
  const baseRomName = game === 'oos' ? 'seasons' : 'ages';
  const randoRom = fs.readFileSync(randoRoot + `oracles-disasm/${baseRomName}.gbc`);
  const vanillaRom = fs.readFileSync(baseRomDir + `${baseRomName}_clean.gbc`);

  const patchData = new Map();

  patchData.set('length', randoRom.length);
  for (let i=0; i<randoRom.length; i++) {
    b = 0;
    if (i < vanillaRom.length)
      b = vanillaRom.readUInt8(i);
    if (b != randoRom.readUInt8(i)) {
      patchData.set(Number(i), Number(randoRom.readUInt8(i)));
    }
  }

  return patchData;
}

router.get('/version', (req, res)=>{
  res.json({version: version})
});

router.post('/randomize', (req,res)=>{
  /*
  * Expects from req.body:
  *   game:          'oos' or 'ooa'  (just append ".blob" to get file to pass into randomizer)
  *   options:       Map of options (corresponding to options.js)
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

  // Get options for execution arguments and seed string
  optionList = Options.get(game);
  execArgs = []
  seedArgs = "";
  for (const option of Object.keys(optionList)) {
    if (optionList[option].type === "combo") {
      let value = String(req.body.options[option]);
      if (!optionList[option].values.includes(value)) {
        console.log(`WARNING: Value '${value}' for option '${option}' not valid`);
        value = optionList[option].values[0];
      }
      if (value !== "off") {
        execArgs.push("-" + option)
        execArgs.push(value);
        seedArgs += `-${option}${value}`
      }
    }
    else if (req.body.options[option] === true) {
      execArgs.push("-" + option);
      seedArgs += "-" + option;
    }
  }
  if (seedArgs.length >= 1) {
    seedArgs = seedArgs.substring(1);
  }

  const pass1 = execArgs.map(arg => arg);
  // No log created with race flag. Create 1 pass normally to get a log file,
  // then second pass add race and plan
  pass1.push('-noui', gameFile);
  console.log(`Running randomizer: ${randoExec} ${pass1.join(' ')}`)
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
      const seed = romFile.split(/[_.]/)[2].split('-')[0]
      const encodedSeed = seedHelper(`${version}_${game}_${seed}_${seedArgs}`);
      const logFileData = fs.readFileSync(logFile, {encoding: 'utf8'});
      const parsedLog = logParse(logFileData, game);
      // const stringified = JSON.stringify(parsedLog);
      const newSeedBase = {
        seed: encodedSeed,
        baseSeed: seed,
        options: req.body.options,
        spoiler: parsedLog,
        originalLog: logFileData,
        locked: req.body.race || false,
        genTime: Math.floor((new Date).valueOf()/1000)
      }
      if (req.body.race){
        newSeedBase.unlockCode = req.body.unlockCode;
        newSeedBase.timeout = req.body.unlockTimeout;
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
  *   version: String indicating version of randomizer used
  *   options: Array of options (keys for options.js)
  *   locked: Boolean if spoiler is available
  *   spoiler: Empty Object if locked, or Object containing spoiler data
  *   originalLog: Raw log file data (TODO: redundant with spoiler)
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
        version: version,
        options: seed.options,
        locked: seed.locked,
        spoiler: seed.spoiler,
        originalLog: seed.originalLog,
        genTime: seed.genTime,
        timeout: seed.timeout,
        unlockTime: seed.unlockTime,
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

router.post('/:game/:id/patch', (req,res)=>{
  /*
  * Expects from req.body:
  *   options:       Dict of post-randomization options
  *
  * Returns an Object with the following keys:
  *   patch: Array of {offset: patch data} objects
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
    if(seed) {
      // Merge base patch and seed-specific data into a single map
      const basePatch = basePatches[game];
      const newPatch = {};

      for (const [key, value] of basePatch) {
        newPatch[key] = value;
      }
      for (const [key, value] of Object.entries(seed.patchData)) {
        newPatch[key] = value;
      }

      // Post-randomization options
      const options = req.body;
      const symbols = symbolMaps[game];

      const readRomByte = (addr) => {
        if (addr in newPatch)
          return newPatch[addr];
        else if (addr >= baseRandoRom[game].length)
          return 0;
        else
          return baseRandoRom[game][addr];
      };

      function patchByte(a, b) {
        newPatch[a] = b;
      }

      // Careful not to overwrite randomization settings other than "auto mermaid suit" here
      const randoConfigAddr = symbols['randoConfig'];
      let randoConfig = readRomByte(randoConfigAddr);
      randoConfig &= ~4;
      if (options.autoMermaid) {
        randoConfig |= 4;
      }
      patchByte(randoConfigAddr, randoConfig);

      // Patch in-game palettes for link
      const paletteBaseAddr = symbols['specialObjectSetOamVariables@data'];
      let palette = 0;
      if (Object.hasOwn(options, 'palette')) {
        if (options.palette === 8) // Choose at random
          palette = Math.floor(Math.random() * 6);
        else if (options.palette >= 0 && options.palette <= 7)
          palette = options.palette;
      }
      for (let i=0; i<10; i++) {
        a = paletteBaseAddr + i * 2 + 1;
        b = readRomByte(a);
        b |= palette;
        patchByte(a, b);
      }

      // Fix file select palettes for link
      for (let i=0; i<8; i++) {
        const src = symbols['standardSpritePaletteData'] + palette * 8;
        const dst = symbols['randoFileSelectLinkPaletteData'];
        patchByte(dst + i, readRomByte(src + i));
      }

      if (palette != 0) {
        // Fix in-game harp palettes by tweaking its sprite attribute byte. It
        // gets OR'd with Link's sprite attribute byte, making it difficult to
        // retain the normal red palette when Link is using nonstandard
        // palettes. This could be fixed with some assembly hacking, but the
        // easier solution is just to let the harp take the same palette as
        // Link, by zero'ing out its own palette value.
        const harpPaletteAddrs = (game === 'oos' ?
            ['oamData481e6', 'oamData481f3'] :
            ['oamData4c1e6', 'oamData4c1f3'])
              .map(a => symbols[a] + 12);
        for (a of harpPaletteAddrs)
          patchByte(a, readRomByte(a) & 0xf8);
      }

      // Validate selected sprite
      const spriteConfig = YAML.parse(fs.readFileSync('shared/sprite-config.yaml', 'utf-8'))
      var spriteName = options['sprite'];
      if (spriteName === 'random') { // Choose a sprite at random
        const spriteList = Object.keys(spriteConfig).filter((s) => s != 'random');
        console.log(spriteList.length);
        spriteName = spriteList[Math.floor(Math.random() * (spriteList.length))];
      }
      else if (!Object.keys(spriteConfig).includes(spriteName)) {
        console.log(`Invalid sprite name '${spriteName}'`);
        spriteName = 'link';
      }

      var spriteData = fs.readFileSync(`sprites/${spriteName}.bin`);
      const spriteAddr = symbols['spr_link'];

      // If using an inverted palette...
      if (palette === 4 || palette === 5) {
        // Invert the sprite to match.
        // (TODO: I guess the transformation rings should be inverted too?)
        console.log('Inverting sprite data');
        spriteData = gb.invertGraphics(spriteData, (i) => {
          // Don't invert these parts of the sprite sheet
          const xy = (x, y) => ((y * 16) + x) * 0x20;
          return i >= xy(12, 13) && i < xy(14, 14); // Glow around link when starting a file, etc
        });

        // Use a different palette when taking damage
        patchByte(symbols['updateLinkInvincibilityCounter@incCounter'] - 2, 0x0a);
      }

      // Patch sprite data
      for (let i=0; i<spriteData.length; i++) {
        patchByte(spriteAddr + i, spriteData[i]);
      }

      // Patch animation data if applicable
      if (Object.keys(spriteConfig[spriteName]).includes('animationHacks')) {
        for (const ah of spriteConfig[spriteName].animationHacks) {
          const label = ah[game === 'oos' ? 'seasonsLabel' : 'agesLabel'];
          const data = ah.data;
          if (!Object.keys(symbols).includes(label)) {
            console.log(`ERROR: label '${label}' doesn't exist, skipping`);
            return;
          }
          console.log(`Patching animation ${label}`);
          const addr = symbols[label];
          for (i=0; i<data.length; i++) {
            patchByte(addr + i, data[i]);
          }
        }
      }

      // Patch gfx pointer data if applicable (only like-like uses this)
      if (Object.keys(spriteConfig[spriteName]).includes('gfxPointerHacks')) {
        Object.entries(spriteConfig[spriteName].gfxPointerHacks).map(([label, entries]) => {
          if (!Object.keys(symbols).includes(label)) {
            console.log(`ERROR: label '${label}' doesn't exist, skipping`);
            return;
          }
          Object.entries(entries).map(([index, data]) => {
            console.log(`Patching gfx pointer ${label} index ${index}`);

            // Parsing data in accordance with the 'm_SpecialObjectGfxPointer'
            // macro in the disassembly
            const addr = symbols[label] + index * 3;
            var word = gb.addrToPtr(symbols[data[1]]); // gfx data file name
            word += data[2]; // offset within data file
            word |= data[3]; // Size of data (divided by 16)
            // Relative bank number (should be 0 or 1))
            word |= gb.addrToBank(symbols[data[1]]) - gb.addrToBank(symbols['gfxDataBank1a'])

            patchByte(addr + 0, data[0]);
            patchByte(addr + 1, word & 0xff);
            patchByte(addr + 2, word >> 8);
          });
        });
      }

      const response = {
        patch: newPatch
      };

      res.send(response);
    }}).catch(err => {
      console.log(err)
      res.send('unable to locate');
    });
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
