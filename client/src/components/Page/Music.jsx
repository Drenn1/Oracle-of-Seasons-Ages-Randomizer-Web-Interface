import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';

function Music() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    axios.get('/music/customMusicTracks.yaml')
         .then(res => {
           // Parse the YAML data
           const parsedData = yaml.load(res.data);
           // Convert the parsed data to an array of objects
           var tracksArray = Object.keys(parsedData).map(key => ({
             id: key,
             ...parsedData[key]
           }));
           tracksArray.sort((a,b) => (a.name > b.name))
           setTracks(tracksArray);
         })
  }, []);

  return (
    <Container>
      <h2>Custom Music Tracks</h2>
      <p>These are the custom music tracks available in the pool when the music
        shuffle setting is set to "all". A typical seed will have a few of these
        replace regular music tracks.</p>
      {tracks.map(track => (
        <Row key={track.id}>
          <Col>
            <Card>
              <Card.Header><h4>{track.name}</h4></Card.Header>
              <Card.Body>
                { track.preview ?
                  <audio controls>
                    <source src={"/music/tracks/" + track.preview} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                  : <i>Audio preview unavailable</i> }
                <p><strong>Source:</strong> {track.source}
                  <br/><strong>Author:</strong> {track.author}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ))}
    </Container>
  );
}

export default Music;
