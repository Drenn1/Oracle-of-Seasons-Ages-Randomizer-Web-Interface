// Post-generation window

import React, { Component } from 'react';
import axios from 'axios';
import Saver from 'file-saver';

import {checkStore, getBuffer} from '../Utility/Storage';
import Sprite from './Sprite';
import Spinner from '../Spinner/Spinner';
import FileSelect from '../Common/FileSelect';
import Log from '../Log/Log';
import Options from '../shared/options';
import Patcher from '../Utility/Patcher';
import './Seed.css';

class Seed extends Component {
  constructor(){
    super();
    this.state = {
      loading: true,
      seedData: null,
      game: null,
      sprite: 0,
      sprites: [],
      palette: 0,
      unlock: false,
      unlockcode: '',
      unlocking: false,
      cosmeticOptions: {
        autoMermaid: true,
        palette: 0,
      }
    }

    this.setValid = this.setValid.bind(this);
    this.checkGame = this.checkGame.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.setSpoiler = this.setSpoiler.bind(this);
    this.setSprite = this.setSprite.bind(this);
    this.patchAndDownload = this.patchAndDownload.bind(this);
    this.downloadLog = this.downloadLog.bind(this);
    this.setUnlockVisibility = this.setUnlockVisibility.bind(this);
    this.checkUnlockCode = this.checkUnlockCode.bind(this);
  }

  checkGame(){
    checkStore(this.state.game || "Seasons", this.setValid);
  }

  patchAndDownload(buffer, game, seed){
    axios.post(`/api/${game}/${seed}/patch`, this.cosmeticOptions)
      .then(res => {
        Patcher(game, buffer, this.state.seedData,
                res.data.patch, seed, this.state.sprites,
                this.state.sprite, this.state.palette);
      }).catch(err =>{
        console.log(err);
      });
  }

  downloadLog(buffer, game, seed) {
    Saver.saveAs(new Blob([this.state.seedData.originalLog]), 'log.txt');
  }

  setOptions(gameTitle){
    const retData = [];
    for (const [key, v] of Object.entries(Options.get(gameTitle))) {
      const liClass = ['list-group-item', 'text-white'];
      const iClass = ['fas', 'mr-2'];
      let toggled = "On"
      if (this.state.seedData.options[key]){
        liClass.push('bg-success');
        iClass.push('fa-check');
      } else {
        liClass.push('bg-danger');
        iClass.push('fa-times');
        toggled = "Off"
      }

      retData.push(<li key={key} className={liClass.join(' ')}><i className={iClass.join(' ')}></i> {v.name} {toggled}</li>)
    };
    return retData;
  }

  setSpoiler() {
    if (this.state.seedData.locked){
      const {genTime, timeout} = this.state.seedData
      const newDateTimeString = new Date((genTime + timeout) * 1000)
      return(
        <div>
          <p>This spoiler is currently locked until {newDateTimeString.toDateString()} {newDateTimeString.toTimeString()}</p>
          <small>Have an unlock code? <a href="/" onClick={e=>this.setUnlockVisibility(e) } id='toggle-unlock-on'>Click Here!</a></small>
          
        </div>
      )
    } else {
      return (<Log game={this.props.match.params.game} mode="seed" spoiler={this.state.seedData.spoiler}/>);
    }
  }

  setSprite(e,key) {
    this.setState({
      [key]: parseInt(e.target.value)
    });
  }

  setValid(valid){
    if (!this.state.valid){
      this.setState({
        valid: valid
      })
    }
  }

  setUnlockVisibility(e){
    e.preventDefault();
    if (e.target.id.includes('toggle-unlock')){
      const newBool = !this.state.unlock;
      this.setState({
        unlock: newBool
      })
    }
  }


  checkUnlockCode(e){
    this.setState({unlocking: true});
    const {game, seed} = this.props.match.params;
    axios.put(`/api/${game}/${seed}/${this.state.unlockcode}`)
      .then(res => {
        window.location.reload();
      }).catch(err =>{
        console.log(err);
        this.setState({
          invalidCode: true,
          unlocking: false,
        });
      })
  }

  componentWillMount(){
    if (!["oos", "ooa"].includes(this.props.match.params.game)){
      this.props.history.push('/randomize');
    }
  }

  componentDidMount(){
    const {game, seed} = this.props.match.params;
    const storageLabel = game === 'oos' ? 'Seasons' : 'Ages';
    axios.get(`/api/${game}/${seed}`)
      .then(res => {
        axios.get('/sprites/sprites.json')
          .then(sres=>{
            this.setState({
              loading: false,
              seedData: res.data,
              game: storageLabel,
              sprites: sres.data
            })
          })
      })
      .catch(err => {
        console.log('Unable to retrieve');
      })
  }

  componentDidUpdate(){
    this.checkGame();
  }

  render() {
    const {game, seed} = this.props.match.params;
    const {seedData} = this.state;
    let bodyContent;
    let titleText;
    const gameTitle = game === "oos" ? "Seasons" : "Ages"

    // TODO Create array of sprites and map to JSX

    if (this.state.loading) {
      bodyContent = (<div className="card-body"><Spinner /></div>)
      titleText = `Fetching Oracle of ${gameTitle} Seed...`
    } else {
      const options = this.setOptions(gameTitle);

      // TODO: Bring the spoiler log back when I'm sure it's working
      //const spoilerLog = this.setSpoiler();
      const spoilerLog = '';

      const extraCheckboxMetadata = [
        {
          "name": "Auto Mermaid Suit",
          "value": "autoMermaid",
        }
      ];

      const miscCheckboxes = [];
      for (const checkbox of extraCheckboxMetadata) {
        const v =
            <div className="form-check" key={checkbox.value}>
            <input className="form-check-input"
                   type="checkbox"
                   checked={this.state.cosmeticOptions.autoMermaid}
                   onChange={e => {
                     const newOptions = {};
                     Object.assign(newOptions, this.state.cosmeticOptions);
                     newOptions[checkbox.value] = e.target.checked;
                     this.setState({cosmeticOptions: newOptions});
                   }}/>
            <label className="form-check-label">Auto Mermaid Suit</label>
          </div>
        miscCheckboxes.push(v);
      }

      bodyContent = (
        <div className="container">
          <a href={`/${game}/${seed}`}>Shareable Link</a>
          <div className="row">
            <div className="col-sm">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Randomization options (fixed)</h3>
                  <ul className="list-group list-group-flush" style={{opacity: 0.7}}>
                    {options}
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-sm">
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Cosmetic options</h3>
                  <Sprite
                    selectedSprite={this.state.sprite}
                    selectedPalette={this.state.palette}
                    sprites={this.state.sprites}
                    setSprite={this.setSprite}
                  />
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h3 className="card-title">Other options</h3>
                  {miscCheckboxes}
                </div>
              </div>
            </div>
          </div>
    
          <div className="row my-5 px-4">
            <button
              type="button"
              className="btn btn-primary col-2"
              disabled={!this.state.valid}
              onClick={e=>getBuffer(this.state.game, game, seed, this.patchAndDownload)}
            > 
                Save Rom
            </button>
            <button
              type="button"
              className="btn btn-primary col-2 ml-2"
              disabled={!this.state.valid}
              onClick={e=>getBuffer(this.state.game, game, seed, this.downloadLog)}
            >
                Save Log
            </button>
            <FileSelect game={game === 'oos' ? 'Seasons' : 'Ages'} inline={true} checkGame={this.checkGame} valid={this.state.valid}/>
          </div>
          {spoilerLog}
        </div>
      )
      titleText = `Oracle of ${gameTitle} (${seedData.version})`
    }
    const inputgroupclassnames = ['input-group', 'mb-3'];
    let errormessage = '';
    if (this.state.invalidCode){
      inputgroupclassnames.push('border','border-danger');
      errormessage = 'Invalid Unlock Code';
    }
  
    let unlockBody = (
      <div className="card-body">
        <span className="text-danger">{errormessage}</span>
        <div className={inputgroupclassnames.join(' ')}>
          <div className="input-group-prepend">
            <span className="input-group-text code-click" id="inputGroup-sizing-default" onClick={this.checkUnlockCode}>Unlock</span>
          </div>
          <input 
            type="text"
            className="form-control"
            onChange={e=>this.setState({unlockcode: e.target.value})}
            value={this.state.unlockcode}
          />
        </div>
        <button className="btn btn-danger btn-block btn-small" id='toggle-unlock-button'>Close Window</button>
      </div>
    );

    if (this.state.unlocking){
      unlockBody = (
        <div className="card-body">
          <Spinner />
        </div>
      );
    }

    const unlock = this.state.unlock ? (
      <div className="unlock-container" id='toggle-unlock-off' onClick={e=>this.setUnlockVisibility(e)}>
        <div className="unlock-box">
        <div className="card">
          <div className="card-header bg-header">
            <div className="col">
              <h3>
                {this.state.unlocking ? 'Checking code...' : 'Enter unlock code'}
              </h3>
            </div>
          </div>
          {unlockBody}
        </div>
        </div>
      </div>
      ) : (<div></div>)

    return (
      <div className="container-fluid" id="base">
        {unlock}
        <div className="card page-container">
          <div className="card-header bg-header">
            <div className="col">
              <h3>
                {titleText}
              </h3>
            </div>
          </div>
          {bodyContent}
        </div>
      </div>
    )
  }
}

export default Seed;
