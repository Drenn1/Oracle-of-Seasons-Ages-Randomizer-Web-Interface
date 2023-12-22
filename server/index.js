const express = require('express');
const app = express();

const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {mongoDBurl}= require('./configs/db');

const version = require('./base/version');

mongoose.connect(mongoDBurl, {useNewUrlParser: true}).then(db=>{
  console.log(`Connected to db`);
}).catch(err =>{
  console.log(err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const api = require('./routes/api');
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