const spriteList = {
  link: {
    defaultPalette: 0,
    display: "Link"
  },
  marin: {
    name: "marin",
    defaultPalette: 3,
    display: "Marin",
    animationHacks: {
      // Flute animation
      "animationData19cf7": [
        60,0x34,0x00,
        30,0x36,0x01,
        60,0x35,0x01,
        30,0x36,0x00,
        60,0x34,0x00,
        15,0x36,0x01,
        0x7f,0x2e,0xff
      ],
    }
  },
  demonlink: {
    defaultPalette: 5,
    display: "Demonic Link"
  },
  likelike: {
    defaultPalette: 3,
    display: "Like-Like"
  }
};

(function(exports){
  // Get the object containing the list of sprites
  exports.get = function(){
    return spriteList;
  };

})(typeof exports === 'undefined'? this['sprite-config']={}: exports);
