import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div className="container-fluid" id="base">
        <div className="card">
          <div className="card-header bg-header">
            <h1 className='text-center'>The Legend of Zelda: Oracle of Seasons/Ages Randomizer</h1>
            <h2 className="text-center">Web Interface</h2>
          </div>
          <div className="card-body">
            <p>This site is an interface for oracles-randomizer-ng, Stewmat's fork of the oracles-randomizer supporting advanced features such as keysanity and cross-items. This site was designed to be user-friendly and to be a quick and efficient way to share seeds without having to post a rom anywhere or having each player generate the seed locally.
            </p>
            <p>See the source code <a href="https://github.com/Stewmath/Oracle-of-Seasons-Ages-Randomizer-Web-Interface">here</a>.</p>
            <p>
              Note: No roms are hosted or downloaded from this site. It merely serves a patch to make the randomized game and your browser applies the patch to your base rom on download.
            </p>

            <h3>Stuck?</h3>
            <p>Try downloading <a href="https://emotracker.net/">EmoTracker</a>! It features a map that follows logic and shows you where you can go with your current equipment quickly!</p>

            <h3>Still lost?</h3>
            <p>Join the <a href="https://discord.gg/FcdGMWC">Oracles Discord</a> and hop into the #randomizer channel! There are several helpful people there that can help you out.</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Home;
