import React, { Component } from 'react';
import axios from 'axios';
import {checkStore, getBuffer} from '../Utility/Storage';
import Sprite from './Sprite';
import Spinner from '../Spinner/Spinner';
import FileSelect from '../Common/FileSelect';
import Log from '../Log/Log';
import flags from '../Utility/Flags';
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
      palette: 0
    }

    this.setValid = this.setValid.bind(this);
    this.checkGame = this.checkGame.bind(this);
    this.setOptions = this.setOptions.bind(this);
    this.setSpoiler = this.setSpoiler.bind(this);
    this.setSprite = this.setSprite.bind(this);
    this.patchAndDownload = this.patchAndDownload.bind(this)
  }

  checkGame(){
    checkStore(this.state.game || "Seasons", this.setValid);
  }

  patchAndDownload(buffer, game, seed){
    Patcher(game,buffer,this.state.seedData,seed,this.state.sprites,this.state.sprite,this.state.palette)
  }

  setOptions(gameTitle){
    return flags(gameTitle).map(flag=>{
      const liClass = ['list-group-item', 'text-white'];
      const iClass = ['fas', 'mr-2'];
      let toggled = "On"
      if (this.state.seedData[flag[0]]){
        liClass.push('bg-success');
        iClass.push('fa-check');
      } else {
        liClass.push('bg-danger');
        iClass.push('fa-times');
        toggled = "Off"
      }

      return (<li key={flag[0]} className={liClass.join(' ')}><i className={iClass.join(' ')}></i> {flag[1]} {toggled}</li>)
    })
  }

  setSpoiler() {
    if (this.state.seedData.locked){
      const {genTime, timeout} = this.state.seedData
      const newDateTimeString = new Date(genTime + timeout)
      return(
        <div>This spoiler is currently locked until {newDateTimeString.toTimeString()}</div>
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
      const spoilerLog = this.setSpoiler();

      bodyContent = (
        <div className="card-body">   
          <a href={`/${game}/${seed}`}>Shareable Link</a>
          <div className="card-group">
            <div className="card">
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {options}
                </ul>
              </div>
            </div>
            <div className="card">
              <Sprite 
                selectedSprite={this.state.sprite}
                selectedPalette={this.state.palette}
                sprites={this.state.sprites}
                setSprite={this.setSprite}
              />
            </div>
          </div>
    
          <div className="row my-5 px-4">
            <button
              type="button"
              className="btn btn-primary btn-block col-3"
              disabled={!this.state.valid}
              onClick={e=>getBuffer(this.state.game, game, seed, this.patchAndDownload)}
            > 
                Save Rom
            </button>
            <FileSelect game={game === 'oos' ? 'Seasons' : 'Ages'} inline={true} checkGame={this.checkGame} valid={this.state.valid}/>
          </div>
          {spoilerLog}
        </div>
      )
      titleText = `Oracle of ${gameTitle} (${seedData.version})`
    }


    return (
      <div className="container-fluid" id="base">
        <div className="card">
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
