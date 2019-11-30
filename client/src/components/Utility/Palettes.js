/*
*  Array of Palette Arrays for gif
* 
*  Col 0 is transparent, so just need col1-col3
*  Each Array is in format of:
*  [col1-r, col1-g, col1-b, col2-r, col2-g, col2-b, col3-r, col3-g, col3-b]
*  Needed offset for gif palette starts at 0x0D and ends at 0x15
*/

export default function () {
  return [[0,0,0,38,142,68,236,190,166],
                [0,0,0,51,158,191,236,190,166], // blue
                [0,0,0,205,16,75,236,190,166], // red
                [0,0,0,217,92,97,236,190,166], // gold
                [173,226,249,53,139,241,0,0,0], // blue (inverted)
                [248,197,110,234,75,55,0,0,0], // red (inverted)
                ];   
}