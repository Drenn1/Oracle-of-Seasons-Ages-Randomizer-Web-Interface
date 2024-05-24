import SparkMD5 from 'spark-md5';
import storage from 'localforage';
storage.config({
  driver: storage.INDEXEDDB,
  name: "oosarando",
  storeName: "games"
});

const checksums = {
  Ages:    'c4639cc61c049e5a085526bb6cac03bb',
  Seasons: 'f2dc6c4e093e4f8c6cbea80e8dbd62cb'
}

export function getBuffer(game, gamecode, seed, cb){
  storage.getItem(game)
    .then(data => {
      cb(data,gamecode,seed);
    })
    .catch(err => {
      console.log(err);
    })
}

export function checkStore(game, cb){
  storage.getItem(game)
    .then(data => {
      if (data !== null)
        cb(checkBufferSum(data, game));
    })
    .catch( err => {
      console.log(err);
    })
}

export function checkSum(file, game, cb) {
  const reader = new FileReader();
  reader.onload = function(){
    if (checkBufferSum(reader.result, game)) {
      storage.setItem(game, reader.result)
             .then(done => {
               cb(true);
             })
             .catch(err => console.log(err))
    } else {
      cb(false);
    }
  }
  reader.readAsArrayBuffer(file);
}

function checkBufferSum(buffer, game) {
  const spark = new SparkMD5.ArrayBuffer();
  spark.append(buffer);
  const hash = spark.end();
  return hash === checksums[game];
}
