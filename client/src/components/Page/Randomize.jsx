import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Spinner from '../Spinner/Spinner';
import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import Options from '../shared/options';

const games = {
  oos: "Seasons",
  ooa: "Ages"
}

function Randomize() {
  const navigate = useNavigate();

  const initialOptionsState = Object.fromEntries(Object.entries(Options).map(
    ([k, o]) => [k, o.type === "combo" ? o.values[0] : false]))

  const [game, setGame] = useState('Seasons');
  const [options, setOptions] = useState(initialOptionsState);
  const [race, setRace] = useState(false);
  const [unlock, setUnlock] = useState(uuidv4().replace(/-/g,''));
  const [timeout, setTimeout] = useState(0);
  const [generating, setGenerating] = useState(false);

  function toggleRace(e){
    setRace(e.target.checked);
  }

  function copyUnlockToClipboard(e){
    e.preventDefault();
    const tempEl = document.createElement("textarea");
    document.body.appendChild(tempEl);
    tempEl.value = unlock;
    tempEl.select();
    document.execCommand('copy');
    document.body.removeChild(tempEl);
  }

  function generate(e){
    setGenerating(true);

    e.preventDefault()
    const data = {
      game: game === "Seasons" ? 'oos' : 'ooa',
      options: options,
      race: race,
    }

    if (race) {
      data.unlockCode = unlock;
      data.unlockTimeout = timeout === 0 ? 14400 : timeout * 60;
    }

    axios.post('/api/randomize', data)
      .then(res => navigate(res.data))
      .catch(err => console.log(err))
  }

  function render() {
    let gameToggle = Object.keys(games).map((g,i) => {
      let cName = "btn";
      if (games[g] === game){
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
        <button className={cName} id={games[g]} key={g} value={games[g]}
                onClick={(e) => setGame(e.target.value)}> {games[g]}</button>
      )
    })
    const optionComponents = [];
    for (const [optName, opt] of Object.entries(Options(game))) {
      var component;
      if (opt.type === "combo") { // Dropdown
        component =
          <Form.Select value={options[optName]}
                       onChange={(e) => {
                         const newOptions = {};
                         Object.assign(newOptions, options);
                         newOptions[optName] = e.target.value;
                         setOptions(newOptions);
                       }}>
            {opt.values.map(
              (value) =>
              <option
                key={optName + '-' + value}>
                {value}
              </option>
            )}
          </Form.Select>
      }
      else { // Checkbox
        component =
          <Form.Check key={optName} type="switch" id={optName} >
            <Form.Check.Input checked={options[optName]} onChange={(e) => {
              const newOptions = {};
              Object.assign(newOptions, options);
              newOptions[e.target.id] = !options[e.target.id];
              setOptions(newOptions);
            }}/>
          </Form.Check>
      }

      optionComponents.push(
        <Row key={optName}>
          <OverlayTrigger placement="right" overlay={<Tooltip id={"tooltip-"+opt.name}>{opt.desc}</Tooltip>}>
            <Col style={{'textAlign': 'right', 'marginTop': 'auto', 'marginBottom': 'auto'}}>{opt.name}</Col>
          </OverlayTrigger>
          <Col>{component}</Col>
        </Row>
      );
    }

    let raceBody = (<div></div>);

    if (race){
      raceBody = (
        <div className="card-body">    
          <div className="row">
            <div className="col">
              <h6>Unlock Code</h6>
              <div className="input-group">
                <div className="form-control">{unlock}</div>
                <div className="input-group-append">
                  <button className="btn btn-primary" onClick={copyUnlockToClipboard}><i className="fas fa-copy mr-2"></i>Copy to Clipboard</button>
                </div>
              </div>
              <small className="text-black-50 mt-3">Needed to unlock the spoiler sooner. Note: once you generate the seed, you will NOT have access to this code, so please copy this first, otherwise you will have to wait the specified time before the log is available.</small>
            </div>
            <div className="col">
              <div className="form-group">
                <h6>Spoiler Lock Duration</h6>
                <input type="number" name="timeout" id="timeout" className="form-control"
                       onChange={(e) => setTimeout(parseInt(e.target.value))} placeholder="0" min="0"/>
              </div>             
              <small className="text-black-50 mt-3">How long in minutes before the spoiler unlocks (default: 240 minutes = 4 hours)</small>
            </div>
          </div>
        </div>
      )
    }

    const header = generating ? `Making Oracle of ${game} Seed` : `Randomize Oracle of ${game}`
    let randoBody = (
      <div className="card-body">
        <div className="row mb-2">
          <div className="col-sm">
            <div className="btn-group btn-group-toggle" id="game-selector" data-toggle="buttons">
              {gameToggle}
            </div>
          </div>
        </div>
        <div className="row">
          <Container style={{'maxWidth': '300px', 'marginLeft': '0'}}>
            {optionComponents}
          </Container>
        </div>
        <div className="card mb-3">
          <div className="card-header">
            <div className="custom-control custom-switch">
              <input type="checkbox" name="" id="race" onClick={toggleRace} className="custom-control-input"></input>
            </div>
          </div>  
          {raceBody}
        </div>
        <button className="btn btn-primary btn-lg btn-block" onClick={generate}>Randomize {game}</button>
      </div>
    )

    if (generating){
      randoBody = (
        <div className="card-body">
          <Spinner />
        </div>
      )
    }

    return (
      <div className="container-fluid" id="base">
        <div className="card">
          <div className="card-header bg-header">
            <h2>{header}</h2>
          </div>
          {randoBody}
        </div>
      </div>
    )
  }

  return render();
}

export default Randomize;
