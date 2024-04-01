// Post-generation window

import React, { Component } from 'react';
import axios from 'axios';
import Saver from 'file-saver';
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {checkStore, getBuffer} from '../Utility/Storage';
import Sprite from '../Common/Sprite';
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
      downloading: false,
      seedData: null,
      game: null,
      unlock: false,
      unlockcode: '',
      unlocking: false,

      sprite: 'link',
      palette: 0,
      autoMermaid: true,
    }

    this.setValid = this.setValid.bind(this);
    this.checkGame = this.checkGame.bind(this);
    this.getOptionsDisplay = this.getOptionsDisplay.bind(this);
    this.setSpoiler = this.setSpoiler.bind(this);
    this.patchAndDownload = this.patchAndDownload.bind(this);
    this.downloadLog = this.downloadLog.bind(this);
    this.setUnlockVisibility = this.setUnlockVisibility.bind(this);
    this.checkUnlockCode = this.checkUnlockCode.bind(this);
  }

  checkGame(){
    checkStore(this.state.game || "Seasons", this.setValid);
  }

  patchAndDownload(buffer, game, seed){
    const cosmeticOptions = {
      sprite: this.state.sprite,
      palette: this.state.palette,
      autoMermaid: this.state.autoMermaid,
    }
    axios.post(`/api/${game}/${seed}/patch`, cosmeticOptions)
      .then(res => {
        Patcher(game, buffer, this.state.seedData, res.data.patch, seed);
        this.setState({downloading: false});
      }).catch(err =>{
        console.log(err);
      });
  }

  downloadLog(buffer, game, seed) {
    Saver.saveAs(new Blob([this.state.seedData.originalLog]), 'log.txt');
  }

  getOptionsDisplay(gameTitle){
    const retData = [];
    for (const [optID, opt] of Object.entries(Options.get(gameTitle))) {
      const liClass = ['list-group-item', 'text-white'];
      const iClass = ['fas', 'mr-2'];

      var value;

      if (opt.type === "combo") {
        value = this.state.seedData.options[optID];
      }
      else { // boolean
        if (this.state.seedData.options[optID]){
          value = "on";
        } else {
          value = "off"
        }
      }

      if (value === "off") {
        liClass.push('bg-danger');
        iClass.push('fa-times');
      }
      else {
        liClass.push('bg-success');
        iClass.push('fa-check');
      }

      retData.push(
        <li key={optID} className={liClass.join(' ')}>
          <i className={iClass.join(' ')}></i>
          {`${opt.name}: ${value}`}
        </li>)
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
      return (<Log game={this.props.router.params.game} mode="seed" spoiler={this.state.seedData.spoiler}/>);
    }
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
    const {game, seed} = this.props.router.params;
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

  componentDidMount(){
    const {game, seed} = this.props.router.params;
    const storageLabel = game === 'oos' ? 'Seasons' : 'Ages';
    axios.get(`/api/${game}/${seed}`)
      .then(res => {
        this.setState({
          loading: false,
          seedData: res.data,
          game: storageLabel,
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
    const {game, seed} = this.props.router.params;
    const {seedData} = this.state;
    let bodyContent;
    let titleText;
    const gameTitle = game === "oos" ? "Seasons" : "Ages"

    if (this.state.loading) {
      bodyContent = (<div className="card-body"><Spinner /></div>)
      titleText = `Fetching Oracle of ${gameTitle} Seed...`
    } else {
      const options = this.getOptionsDisplay(gameTitle);

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
                   checked={this.state.autoMermaid}
                   onChange={e => this.setState({autoMermaid: e.target.checked})}
                   />
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
                  <h3 className="card-title">Randomization options</h3>
                  <ul className="list-group list-group-flush" style={{opacity: 1.0}}>
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
                    paletteIndex={this.state.palette}
                    setSprite={(s, p) => {
                      this.setState({sprite: s, palette: p})
                    }}
                    setPalette={(p) => this.setState({palette: p})}
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
            <div className="col-sm">
              <button
                type="button"
                className="btn btn-primary ml-2"
                disabled={!this.state.valid}
                onClick={e => {
                  this.setState({downloading: true});
                  getBuffer(this.state.game, game, seed, this.patchAndDownload)
                }}
              >
                {this.state.downloading ?
                 <><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                   <span class="sr-only">Downloading...</span></>
                 : "Download Rom"}
              </button>
              <button
                type="button"
                className="btn btn-primary ml-2"
                disabled={!this.state.valid}
                onClick={e=>getBuffer(this.state.game, game, seed, this.downloadLog)}
              >
                Download Log
              </button>
            </div>
            <div className="col-sm">
              <FileSelect game={game === 'oos' ? 'Seasons' : 'Ages'}
              inline={true} checkGame={this.checkGame}
              valid={this.state.valid}/>
            </div>
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


// Workaround for changes to react routing in v18
function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}


export default withRouter(Seed);
