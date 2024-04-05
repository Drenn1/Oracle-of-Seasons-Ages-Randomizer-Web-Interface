// Helper functions for gameboy-related stuff (pointer arithmetic, etc)

function ptrToAddr(bank, pointer) {
  console.assert(pointer >= 0 && pointer < 0x10000);

  // RAM (ignore bank number, we'll probably never reference this anyway)
  if (pointer >= 0x8000)
    return pointer;
  // ROM
  else if (bank == 0) {
    console.assert(pointer < 0x4000);
    return pointer;
  }
  else {
    console.assert(pointer >= 0x4000 && pointer < 0x8000);
    return bank * 0x4000 + (pointer - 0x4000);
  }
}

function addrToPtr(address) {
  if (address < 0x4000)
    return address;
  return (address & 0x3fff) + 0x4000;
}

function addrToBank(address) {
  return Math.floor(address / 0x4000);
}

// Takes a byte array representing tile graphics data as input, returns the
// inverted version of that. (Color 0 is left unchanged as it's "transparent"
// for sprites; colors 1-3 are inverted.)
// ignoreCheck is a function which takes an offset within the data and return
// true iff that offset should not be inverted.
function invertGraphics(data, ignoreCheck) {
  console.assert(data.length % 2 === 0, 'Malformed graphics data')

  if (ignoreCheck === undefined)
    ignoreCheck = (i) => false;

  const output = [];

  for (i=0; i<data.length; i+=2) {
    let b0 = data[i]
    let b1 = data[i+1]

    if (ignoreCheck(i)) {
      output.push(b0);
      output.push(b1);
      continue;
    }

    let n0 = 0, n1 = 0;

    for (let x=0; x<8; x++) {
      const color = (b0 & 1) | ((b1 & 1) << 1);
      b0 >>= 1;
      b1 >>= 1;

      const newColor = [0, 3, 2, 1][color];

      n0 |= (newColor & 1) << 8;
      n1 |= ((newColor >> 1) & 1) << 8;
      n0 >>= 1;
      n1 >>= 1;
    }

    output.push(n0);
    output.push(n1);
  }

  return output;
}

module.exports = {
  ptrToAddr,
  addrToPtr,
  addrToBank,
  invertGraphics
};
