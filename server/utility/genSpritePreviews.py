#!/usr/bin/python3
#
# Run this script to generate all sprite image previews based on the data in
# sprite-config.yaml.

import sys, os, yaml
from PIL import Image

PALETTES = [
        [0,0,0,38,142,68,236,190,166, 255,255,255],
        [0,0,0,51,158,191,236,190,166,255,255,255],
        [0,0,0,205,16,75,236,190,166, 255,255,255],
        [0,0,0,217,92,97,236,190,166, 255,255,255],
        [0,0,0,53,139,241,173,226,249,255,255,255],
        [0,0,0,234,75,55,248,197,110, 255,255,255],
        ];

paletteScramble = [3, 0, 1, 2]

IMAGE_SCALE = 4
TILE_ADDRESS = 0x240
#TILE_ADDRESS = 0x68240 # Use this to read from a ROM file


def drawTile(img, data, x, y, address, flipX=False):
    for j in range(0,8):
        b1 = data[address + j*2]
        b2 = data[address + j*2 + 1]
        for i in range(0,8):
            c = (b1&1) | ((b2&1)<<1)
            b1 >>= 1
            b2 >>= 1

            c = paletteScramble[c]

            if flipX:
                img.putpixel((x + i, y + j), c)
            else:
                img.putpixel((x + (7-i), y + j), c)


spriteConfigFile = 'server/shared/sprite-config.yaml'
if not os.path.exists(spriteConfigFile):
    print(f"Couldn't locate {spriteConfigFile}. Run this script from the root of the project repository.")
    sys.exit(1)

with open(spriteConfigFile, 'r') as f:
    spriteConfig = yaml.safe_load(f.read())

def genSpriteImage(name):
    with open(f'server/sprites/{name}.bin', 'rb') as f:
        data = bytearray(f.read())

    outFilename = f'client/public/img/sprite/{name}.gif'
    paletteIndex = spriteConfig[name]['defaultPalette']

    img = Image.new('P', (16, 16), 0)
    img.putpalette(PALETTES[paletteIndex], 'RGB')

    drawTile(img, data, 0, 0, TILE_ADDRESS)
    drawTile(img, data, 0, 8, TILE_ADDRESS + 16)
    drawTile(img, data, 8, 0, TILE_ADDRESS + 32)
    drawTile(img, data, 8, 8, TILE_ADDRESS + 48)

    img = img.resize((16 * IMAGE_SCALE, 16 * IMAGE_SCALE), resample=Image.NEAREST)

    outFile = open(outFilename, 'wb')
    img.save(outFile, palette=PALETTES[paletteIndex], transparency=3)
    outFile.close()

for sprite in spriteConfig:
    if sprite == 'random':
        continue
    print(f'Generating sprite preview for {sprite}...', end='')
    genSpriteImage(sprite)
    print(' OK')
