import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import Spinner from '../Spinner/Spinner';
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
  const [generating, setGenerating] = useState(false);

  function generate(e){
    setGenerating(true);

    e.preventDefault()
    const data = {
      game: game === "Seasons" ? 'oos' : 'ooa',
      options: options,
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

    const header = generating ? `Making Oracle of ${game} Seed` : `Randomize Oracle of ${game}`
    let randoBody = (
      <Card.Body>
        <div className="mb-3">
          <p>Check the <a href="/info">info page</a> if this is your first time!</p>
          <p>Hover over the option names for more information.</p>
        </div>
        <div className="row mb-2">
          <div className="col">
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
        <button className="btn btn-primary btn-lg btn-block mt-3"
                onClick={generate}>Randomize {game}</button>
      </Card.Body>
    )

    if (generating){
      randoBody = (
        <Card.Body>
          <Spinner />
        </Card.Body>
      )
    }

    return (
      <Container>
        <Card>
          <div className="card-header bg-header">
            <h2>{header}</h2>
          </div>
          {randoBody}
        </Card>
      </Container>
    )
  }

  return render();
}

export default Randomize;
