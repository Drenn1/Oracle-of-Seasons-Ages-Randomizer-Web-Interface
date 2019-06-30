import React, { Component } from 'react';
import FileSelect from '../Common/FileSelect';
import CheckBox from '../Common/CheckBox';
import {checkStore} from '../Utility/storage';
import uuid from 'uuid';
import axios from 'axios';
import flags from '../Utility/flags';

const games = {
  oos: "Seasons",
  ooa: "Ages"
}

class randomize extends Component {
  constructor(){
    super();
    this.state = {
      game: "Seasons",
      hard: false,
      treewarp: false,
      dungeons: false,
      portals: false,
      race: false,
      valid: false,
      unlock: uuid.v4().replace(/-/g,''),
      timeout: 0,
    };
    this.validRom = false;
    this.selectGame = this.selectGame.bind(this);
    this.setValid = this.setValid.bind(this);
    this.toggleCheck = this.toggleCheck.bind(this);
    this.toggleRace = this.toggleRace.bind(this);
    this.checkGame = this.checkGame.bind(this);
    this.generate = this.generate.bind(this);
  }

  selectGame(e){
    this.setState({
      game: games[e.target.value]
    })
  }

  checkGame(){
    checkStore(this.state.game || "Seasons", this.setValid);
  }

  setValid(valid){
    this.setState({
      valid: valid
    })
  }

  toggleCheck(e){
    e.preventDefault();
    let newState = !this.state[e.target.id];
    this.setState({[e.target.id]: newState});
  }

  toggleRace(e){
    let bool = e.target.checked;
    this.setState({
      race: bool
    })
  }

  generate(e){
    e.preventDefault()
    const data = {
      game: this.state.game === "Seasons" ? 'oos' : 'ooa',
      hardMode: this.state.hard,
      treeWarp: this.state.treewarp,
      dungeons: this.state.dungeons,
      portals: this.state.portals,
      race: this.state.race,
    }

    if (this.state.race) {
      data.unlockCode = this.state.unlockCode;
      data.unlockTimeout = this.state.timeout === 0 ? 14400 : this.state.timeout * 60;
    }

    axios.post('/api/randomize', data)
      .then(res => this.props.history.push(res.data))
      .catch(err => console.log(err))
  }

  componentDidMount(){
    this.checkGame();
  }

  componentDidUpdate(prevProps, prevState, snapshot){
    if (this.state.game !== prevState.game){
      this.checkGame();
    }
  }

  render() {
    let gameToggle = Object.keys(games).map((game,i) => {
      let cName = "btn";
      if (games[game] === this.state.game){
        cName += " btn-info"
      } else {
        cName += " btn-secondary"
      }

      if (i === 0){
        cName += " rounded-left"
      } else if (i === Object.keys(games).length - 1){
        cName += " rounded-right"
      }
      return (
        <button className={cName} id={games[game]} key={game} value={game} onClick={this.selectGame}> {games[game]}</button>
      )
    })
    const checkboxes = flags(this.state.game);
  
    const options = checkboxes.map(flag => (<CheckBox key={flag[0]} value={flag[0]} label={flag[1]} info={flag[2]} checked={this.state[flag[0]]} onCheck={this.toggleCheck}/>))

    let raceBody = (<div></div>);

    if (this.state.race){
      raceBody = (
        <div className="card-body">    
          <div className="row">
            <div className="col">
              <h6>Unlock Code</h6>
              <div className="input-group">
                <div className="form-control">{this.state.unlock}</div>
                <div className="input-group-append">
                  <button className="btn btn-primary"><i className="fas fa-copy mr-2"></i>Copy to Clipboard</button>
                </div>
              </div>
              <small className="text-black-50 mt-3">Needed to unlock the spoiler sooner. Note: once you generate the seed, you will NOT have access to this code, so please copy this first, otherwise you will have to wait the specified time before the log is available.</small>
            </div>
            <div className="col">
              <div className="form-group">
                <h6>Spoiler Lock Duration</h6>
                <input type="number" name="timeout" id="timeout" className="form-control" placeholder="0" min="0"/>
              </div>             
              <small className="text-black-50 mt-3">How long in minutes before the spoiler unlocks (default: 240 minutes = 4 hours)</small>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="container-fluid" id="base">
        <div className="card">
          <div className="card-header bg-header">
            <h2>Randomize Oracle of {this.state.game}</h2>
          </div>
          <div className="card-body">
            <div className="row mb-2">
              <div className="col-sm">
                <div className="btn-group btn-group-toggle" id="game-selector" data-toggle="buttons">
                  {gameToggle}
                </div>
              </div>
              <FileSelect game={this.state.game} checkGame={this.checkGame} valid={this.state.valid}></FileSelect>
            </div>
            <div className="row">
              {options}
            </div>
            <div className="card mb-3">
              <div className="card-header">
                <div className="custom-control custom-switch">
                  <input type="checkbox" name="" id="race" onClick={this.toggleRace} className="custom-control-input"></input>
                  <label htmlFor="race" className="custom-control-label"><span className="font-weight-bolder">Race?</span>  Disables immediate access to the spoiler log, which will become available until you enter in the unlock code or after a specified duration after seed generation.</label>
                </div>
              </div>  
              {raceBody}
            </div>
            <button className="btn btn-primary btn-lg btn-block" disabled={!this.state.valid} onClick={this.generate}>Randomize {this.state.game}</button>
          </div>
        </div>
      </div>
    )
  }
}

export default randomize;