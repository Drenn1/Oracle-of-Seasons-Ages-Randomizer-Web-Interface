export function parseIPS(rom,ipsBuffer){
  const ips = new DataView(ipsBuffer);

  // Ignore first 5 bytes (offsets 0-4)
  var i = 5;
  while (true) {
    if (ips.getUint8(i) === 0x45 && ips.getUint8(i+1) === 0x4f && ips.getUint8(i+2) === 0x46){ // EOF
      break;
    }
    /* 
      i, i+1, i+2 = offset
      i+3, i+4 = patch length in bytes OR 0000 = RLE record 
      i+5 and beyond: data to patch
    */
    let offset = (ips.getUint16(i)<<8) | ips.getUint8(i+2);
    i+=3;
    let length = ips.getUint16(i);
    i+=2;
    if (length > 0) {
      for (let x=0; x < length; x++){
        rom[offset] = ips.getUint8(i);
        i++;
        offset++;
      }
    } else {
      // if length is 0, then RLE record. the next two bytes is number of times to repeat the next byte;
      length = ips.getUint16(i);
      i+=2;
      const b = ips.getUint8(i);
      i++;
      for (let x=0; x < length; x++){
        rom[offset] = b;
        offset++;
      }
    }
  }
}
