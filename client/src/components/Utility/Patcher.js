import * as bps from 'bps';

import Saver from 'file-saver';
import {readPointer,writePointer} from './RomHelper';

const agesLinkObjectPaletteOffsets = [82446,82448,82450,82452,82454,82456,82458,82460,82462,82464];

function finalize(rom_array, romName){
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
  Saver.saveAs(finishedRom, `${romName}.gbc`);
}

export default function(game, vanilla, bpsPatch, seedPatch, seed) {
  const romName = 'webrando_' + seed;

  // Apply BPS patch (base rando rom)
  //bpsPatch = new TextEncoder().encode(bpsPatch);
  const bpsInstructions = bps.parse(new Uint8Array(bpsPatch)).instructions;
  const rom_array = bps.apply(bpsInstructions, new Uint8Array(vanilla));

  // Apply seed-specific patch
  for (const [key, value] of Object.entries(seedPatch)) {
    rom_array[Number(key)] = Number(value);
  }

  finalize(rom_array, romName);
}
