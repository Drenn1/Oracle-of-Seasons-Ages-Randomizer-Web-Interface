// TODO: Move this file into server/ directory so that changes are detected
const spriteList = {
  "link": {
    "defaultPalette": 0,
    "display": "Link"
  },
  // NOTE: File select harp-playing animation is probably broken for marin due
  // to animation hacks. Doesn't really matter since linked games aren't
  // supported, for now.
  "marin": {
    "defaultPalette": 3,
    "display": "Marin",
    "animationHacks": [
      {
        // Flute animation
        agesLabel:    'animationData19f90',
        seasonsLabel: 'animationData19cf7',
        data: [
          60,0x34,0x00,
          30,0x35,0x01,
          60,0x36,0x01,
          30,0x35,0x00,
          60,0x34,0x00,
          15,0x35,0x01,
          0x7f,0x2e,0xff
        ]
      },
      {
        // Harp animation
        agesLabel:    'animationData19faa',
        seasonsLabel: 'animationDataHarp',
        data: [
          40,0x34,0x00,
          12,0x35,0x01,
          40,0x36,0x01,
          12,0x35,0x00,
          40,0x34,0x00,
          12,0x35,0x01,
          40,0x36,0x01,
          12,0x35,0x00,
          40,0x34,0x00,
          12,0x35,0x01,
          0x01,0x36,0x81,
          0x7f,0x1c,0xff
        ]
      },
    ]
  },
  "demonlink": {
    "defaultPalette": 5,
    "display": "Demonic Link"
  },
  "likelike": {
    "defaultPalette": 3,
    "display": "Like-Like"
  }
};

(function(exports){
  // Get the object containing the list of sprites
  exports.get = function(){
    return spriteList;
  };

})(typeof exports === 'undefined'? this['sprite-config']={}: exports);
