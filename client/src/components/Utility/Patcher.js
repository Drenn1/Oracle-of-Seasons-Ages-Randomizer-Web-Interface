import Saver from 'file-saver';
import {parseIPS} from './ParseIPS';
import {readPointer,writePointer} from './RomHelper';
import Flags from './Flags';

const agesLinkObjectPaletteOffsets = [82446,82448,82450,82452,82454,82456,82458,82460,82462,82464];

function patchPaletteData(rom_array, paletteIndex, ages){
  const LinkPaletteOffsets = ages ? agesLinkObjectPaletteOffsets : agesLinkObjectPaletteOffsets.map((x,i)=>{
    return x - 66;
  });

  LinkPaletteOffsets.forEach(offset=>{
    rom_array[offset] = rom_array[offset] | paletteIndex;
  });

  const linkOamTable = ages ? 0x1a0a7 : 0x19d9e;
  const oamBank = ages ? 0x13 : 0x12;

  // Preserve the palettes of everything that's not link's color (ie. harp)
  for (let i=0; i<48; i++) {
    let addr = readPointer(rom_array, linkOamTable + i*2, oamBank);
    let count = rom_array[addr];
    addr++;
    for (let j=0; j<count; j++) {
      if ((rom_array[addr+3] & 7) !== 0) {
        if (i >= 46 && paletteIndex  >= 4) // Harp only: use inverted palettes
          rom_array[addr+3] = (rom_array[addr+3] & ~7);
        else // Everything else: use its original palette
          rom_array[addr+3] ^= paletteIndex;
      }
      addr += 4;
    }
  }

  // Address of standard sprite palettes
  const paletteSrc = ages ? 0x5c8f0 : 0x58840;
  // Free space to put modified copy of sprite palettes for file select screen
  const fileSelectPaletteAddr = ages ? 0x5eee3 : 0x5ba07;
  // Copy normal palettes
  for (let x=8; x<8*4; x++)
    rom_array[fileSelectPaletteAddr + x] = rom_array[paletteSrc + x];
  // Replace first palette (green) with appropriate one
  for (let x=0; x<8; x++)
    rom_array[fileSelectPaletteAddr + x] = rom_array[paletteSrc + x + paletteIndex * 8];
  // Replace file select's palette reference to newly created data
  if (ages) {
    writePointer(rom_array, 0x64de, fileSelectPaletteAddr);
    writePointer(rom_array, 0x64ea, fileSelectPaletteAddr);
  }
  else {
    writePointer(rom_array, 0x6428, fileSelectPaletteAddr);
    writePointer(rom_array, 0x6434, fileSelectPaletteAddr);
  }

  if (paletteIndex >= 4) {
    // For "inverted" palettes, change the damage-taking palette to 1 or
    // 2 (depending if it's red or blue).
    const damagePalette = (paletteIndex-3) | 8;
    if (ages)
      rom_array[0x14290] = damagePalette;
    else
      rom_array[0x1424e] = damagePalette;
  }
}

function finalize(rom_array, flags){
  // All patches applied. Recalculate rom checksum.
  var checksum = 0
  for (let i=0; i<rom_array.length; i++) {
    if (i === 0x14e || i === 0x14f)
      continue;
    checksum += rom_array[i];
    checksum &= 0xffff;
  }
  rom_array[0x14e] = checksum >> 8;
  rom_array[0x14f] = checksum & 0xff;

  const finishedRom = new Blob([rom_array]);
  Saver.saveAs(finishedRom, `${flags}.gbc`);
}

export default function(game, vanilla, seedData, seed, sprites, spriteIndex, paletteIndex) {
  const flags = Flags(game);
  const flagData = [seedData.hard, seedData.crossitems, seedData.dungeons, seedData.portals || false];
  const appendedFlags = flags.map(flag=>flag[0]).filter((flag,i)=>flagData[i]);
  appendedFlags.unshift(game,'webrando',seed);
  const rom_array = new Uint8Array(vanilla);

  for (const [key, value] of Object.entries(seedData.patch)) {
    rom_array[Number(key)] = Number(value);
  }

  if (paletteIndex > 0){
    patchPaletteData(rom_array, paletteIndex, game === "ooa");
  }

  // Default sprite will be index 0, so don't need to alter sprite data here
  if (spriteIndex > 0) {
    let modifier = ''
    if (sprites[spriteIndex].extendedRom) {
      rom_array.push([0] * 0x4000 * 0x40)
    }
    if (sprites[spriteIndex].separatePatches && game === "ooa"){
      modifier = 'ages/';
    }
    fetch(`/sprites/patch/${modifier}${sprites[spriteIndex].name}.ips`)
      .then(res=>res.arrayBuffer().then(buffer=>{
        parseIPS(rom_array,buffer);
        finalize(rom_array, appendedFlags.join('-'));
      }))
  } else {
    finalize(rom_array, appendedFlags.join('-'));
  }
}
