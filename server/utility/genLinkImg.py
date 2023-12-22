# Generate a .gif file of a Link sprite from a rom file.

import sys
from PIL import Image

PALETTES = [
        [0,0,0,38,142,68,236,190,166, 255,255,255,],
        [0,0,0,51,158,191,236,190,166,255,255,255],
        [0,0,0,205,16,75,236,190,166, 255,255,255],
        [0,0,0,217,92,97,236,190,166, 255,255,255],
        [173,226,249,53,139,241,0,0,0,255,255,255],
        [248,197,110,234,75,55,0,0,0, 255,255,255],
        ];

paletteScramble = [3, 0, 1, 2]

IMAGE_SCALE = 4
TILE_ADDRESS = 0x68240


def drawTile(img, x, y, address, flipX=False):
    for j in range(0,8):
        b1 = rom[address + j*2]
        b2 = rom[address + j*2 + 1]
        for i in range(0,8):
            c = (b1&1) | ((b2&1)<<1)
            b1 >>= 1
            b2 >>= 1

            c = paletteScramble[c]

            if flipX:
                img.putpixel((x + i, y + j), c)
            else:
                img.putpixel((x + (7-i), y + j), c)


if len(sys.argv) < 4:
    print('Usage: ' + sys.argv[0] + ' rom.gbc output_image.gif paletteIndex [--flipped]')
    sys.exit(1)

romFile = open(sys.argv[1], 'rb')
rom = bytearray(romFile.read())
romFile.close()

outFilename = sys.argv[2]
paletteIndex = int(sys.argv[3])

if len(sys.argv) > 4 and sys.argv[4] == '--flipped':
    flipped = True
else:
    flipped = False


img = Image.new('P', (16, 16), 0)
img.putpalette(PALETTES[paletteIndex], 'RGB')

if flipped:
    drawTile(img, 0, 0, TILE_ADDRESS)
    drawTile(img, 0, 8, TILE_ADDRESS + 16)
    drawTile(img, 8, 0, TILE_ADDRESS, flipX=True)
    drawTile(img, 8, 8, TILE_ADDRESS, flipX=True)
else:
    drawTile(img, 0, 0, TILE_ADDRESS)
    drawTile(img, 0, 8, TILE_ADDRESS + 16)
    drawTile(img, 8, 0, TILE_ADDRESS + 32)
    drawTile(img, 8, 8, TILE_ADDRESS + 48)

img = img.resize((16 * IMAGE_SCALE, 16 * IMAGE_SCALE), resample=Image.NEAREST)

outFile = open(outFilename, 'wb')
img.save(outFile)
outFile.close()
