// Post-generation window

import { useState, useEffect } from 'react';
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

function Seed() {
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [seedData, setSeedData] = useState(null);
  const [game, setGame] = useState(null);
  const [sprite, setSprite] = useState('link');
  const [palette, setPalette] = useState(0);
  const [autoMermaid, setAutoMermaid] = useState(true);
  const [valid, setValid] = useState(false);

  function checkGame(){
    checkStore(game || "Seasons", setValid);
  }

  function patchAndDownload(buffer, game, seed) {
    const cosmeticOptions = {
      sprite: sprite,
      palette: palette,
      autoMermaid: autoMermaid,
    }
    axios.post(`/api/${game}/${seed}/patch`, cosmeticOptions)
         .then(res => {
           Patcher(game, buffer, seedData, res.data.patch, seed);
           setDownloading(false);
         }).catch(err =>{
           console.log(err);
         });
  }

  function downloadLog(buffer, game, seed) {
    Saver.saveAs(new Blob([seedData.originalLog]), 'log.txt');
  }

  function getOptionsDisplay(gameTitle) {
    const retData = [];
    for (const [optID, opt] of Object.entries(Options(gameTitle))) {
      const liClass = ['list-group-item', 'text-white'];
      const iClass = ['fas', 'mr-2'];

      var value;

      if (opt.type === "combo") {
        value = seedData.options[optID];
      }
      else { // boolean
        if (seedData.options[optID]){
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

  useEffect(() => {
    const gameCode = params.game;
    const seed = params.seed;
    const storageLabel = game === 'oos' ? 'Seasons' : 'Ages';
    axios.get(`/api/${gameCode}/${seed}`)
      .then(res => {
        setLoading(false);
        setSeedData(res.data);
        setGame(storageLabel);
      })
      .catch(err => {
        console.log('Unable to retrieve');
        console.log(err);
      })

    checkGame();
  }, []);

  function render() {
    const gameCode = params.game;
    const seed = params.seed;

    let bodyContent;
    let titleText;
    const gameTitle = gameCode === "oos" ? "Seasons" : "Ages"

    if (loading) {
      bodyContent = (<div className="card-body"><Spinner /></div>)
      titleText = `Fetching Oracle of ${gameTitle} Seed...`
    } else {
      const options = getOptionsDisplay(gameTitle);

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
                   checked={autoMermaid}
                   onChange={e => { setAutoMermaid(e.target.checked); }}
                   />
            <label className="form-check-label">Auto Mermaid Suit</label>
          </div>
        miscCheckboxes.push(v);
      }

      bodyContent = (
        <div className="container">
          <a href={`/${gameCode}/${seed}`}>Shareable Link</a>
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
                    selectedSprite={sprite}
                    paletteIndex={palette}
                    setSprite={(s, p) => {
                      setSprite(s);
                      setPalette(p);
                    }}
                    setPalette={(p) => setPalette(p)}
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
                disabled={!valid}
                onClick={e => {
                  setDownloading(true);
                  getBuffer(game, gameCode, seed, patchAndDownload)
                }}
              >
                {downloading ?
                 <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                   <span className="sr-only">Downloading...</span></>
                 : "Download Rom"}
              </button>
              <button
                type="button"
                className="btn btn-primary ml-2"
                disabled={!valid}
                onClick={e=>getBuffer(game, gameCode, seed, downloadLog)}
              >
                Download Log
              </button>
            </div>
            <div className="col-sm">
              <FileSelect game={gameCode === 'oos' ? 'Seasons' : 'Ages'}
              inline={true} checkGame={checkGame}
              valid={valid}/>
            </div>
          </div>
        </div>
      )
      titleText = `Oracle of ${gameTitle} (${seedData.version})`
    }

    return (
      <div className="container-fluid" id="base">
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

  return render();
}


export default Seed;
