import SparkMD5 from 'spark-md5';
import storage from 'localforage';
storage.config({
  driver: storage.INDEXEDDB,
  name: "oosarando",
  storeName: "games"
});

const checksums = {
  Ages: 'c4639cc61c049e5a085526bb6cac03bb',
  Seasons: 'f2dc6c4e093e4f8c6cbea80e8dbd62cb'
}

export function getBuffer(game, gamecode, seed, cb){
  storage.getItem(game)
    .then( data => {
      cb(data,gamecode,seed);
    })
    .catch( err => {
      console.log(err);
    })
}

export function checkStore(game, cb){
  storage.getItem(game)
    .then( data => {
      cb(data);
    })
    .catch( err => {
      console.log(err);
    })
}

export function checkSum(file, game, cb) {
  const reader = new FileReader();
  const spark = new SparkMD5.ArrayBuffer();
  reader.onload = function(){
    spark.append(reader.result);
    const hash = spark.end();
    if (hash === checksums[game]){
      storage.setItem(game, reader.result)
        .then( done => {
          cb()
          return true;
        })
        .catch(err => console.log(err))
      } else {
        return false;
    } 
  }
  reader.readAsArrayBuffer(file);
}
