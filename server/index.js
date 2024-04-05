import express from 'express';
const app = express();

import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import {mongoDBurl} from './configs/db.cjs';

import version from './base/version.cjs';

mongoose.connect(mongoDBurl, {useNewUrlParser: true}).then(db=>{
  console.log(`Connected to db`);
}).catch(err =>{
  console.log(err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

import api from './routes/api.js';
app.use('/api', api);

// Serve static html in client/build if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  })
}

const port = process.env.PORT || 5000;
app.listen(port, ()=>{
  console.log(`Zelda Oracles Randomizer ${version} running on port ${port}`);
})
