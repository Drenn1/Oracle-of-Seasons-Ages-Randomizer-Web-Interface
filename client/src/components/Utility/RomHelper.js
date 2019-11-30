// Helper functions for dealing with gameboy roms

export function writePointer(rom, addr, val) {
  val = (val & 0x3fff) + 0x4000;
  rom[addr] = val & 0xff;
  rom[addr+1] = val >> 8;
}

export function readPointer(rom, addr, bank) {
  return ((rom[addr] | (rom[addr+1] << 8)) & 0x3fff) + bank * 0x4000;
}
