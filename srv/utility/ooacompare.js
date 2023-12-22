const fs = require('fs');
const addr = [];
const basePatch = [];
const seedAddr = [];
const mongoose = require('mongoose');
const Base = require('../models/Base');
const Addr = require('../models/Addr');

const version = require('../base/version');

let mongoDbURI = 'mongodb://localhost:27017/oracles';

const base = fs.readFileSync('../base/ooa.blob');

if (process.argv.includes('-LIVE')){
  mongoDbURI = process.env.ORACLESMONGO || 'mongodb://localhost:27017/oracles';
}

function findUnequal(file){
  const rando = fs.readFileSync(`./ages/${file}`);
  console.log(`Base length:  ${base.length}`);
  console.log(`Rando length: ${rando.length}`);
  let j = 0;
  for (i=0; i < base.length; i++){
    // output += base.readUInt8(i).toString(16) + " ";
    if (base.readUInt8(i) !== rando.readUInt8(i)){
      if (!(addr.includes(i))){
        addr.push(i);
        j++;
      }
    }
  }
  console.log(addr.length);
  console.log(`${j} items added`);
  return base.length;
}

function buildPatch(file, firstFile){
  const data = fs.readFileSync(`./ages/${file}`);
  if (file == firstFile){
    // Build initial object of {offset:data}
    addr.forEach(offset =>{
      const bytePatch = {}
      bytePatch.offset =  offset;
      bytePatch.data = data.readUInt8(offset);
      basePatch.push(bytePatch);
    })
  } else {
    basePatch.forEach((bytePatch, i)=>{
      const patchData = data.readUInt8(bytePatch.offset);
      if (patchData != bytePatch.data){
        // Base patch should have same thing set every rom
        if (!seedAddr.includes(bytePatch)){
          seedAddr.push(bytePatch.offset);
          basePatch.splice(i,1);
        }
      }
    });

    console.log(basePatch.length);
    console.log(seedAddr.length);
  }
}

mongoose.Promise = global.Promise;
mongoose.connect(mongoDbURI, {useNewUrlParser: true}).then(db=>{
  console.log(`Connected to db`);
  fs.readdir('./ages', (err, files)=>{
    files.forEach(file =>{
      if (file.slice(-3) == "txt"){
        files.splice(files.indexOf(file), 1);
        fs.unlink(`./ages/${file}`, err=>{if (err) console.log(err)})
      }
    });
  
    files.forEach(file =>{
      findUnequal(file);
    })

    basePatch.sort((a,b)=>{return a.offset - b.offset});
    files.forEach(file =>{
      buildPatch(file, files[0]);
    })

    seedAddr.sort((a,b)=>{return a - b});
        const newBase = new Base({
          game: "ooa",
          version: version,
          patchData: basePatch
        });
        
        newBase.save().then( savedBase => {
          const newAddr = new Addr({
            game: "ooa",
            patchData: seedAddr
          });

          newAddr.save().then ( savedAddr => {
            console.log("Base and Addr records updated");
            process.exit();
          });
        })
  });
}).catch(err =>{
  console.log(err);
});
