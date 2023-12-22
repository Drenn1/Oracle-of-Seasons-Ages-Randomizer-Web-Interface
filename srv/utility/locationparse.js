const fs = require('fs');
const logfile = fs.readFileSync('./sortedSeasons', 'utf8');
const locationarr = logfile.split('\r\n');
const items = {keys: [], items: []};
let key;
locationarr.forEach((item) => {
  if (item.substr(0,1) === '.'){
    key = item.substr(1)
    items.keys.push(key);
  } else {
    const itemObj = {};
    itemObj.name = item;
    itemObj.placed = false;
    itemObj.category = key;
    itemObj.index = items.items.length;
    items.items.push(itemObj);
  }
})

const json = JSON.stringify(items);
fs.writeFileSync('items.json', json, 'utf8');
