import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div className="container-fluid" id="base">
        <div className="card">
          <div className="card-header bg-header">
            <h1 className='text-center'>Oracles-Randomizer-NG: Oracle of Ages & Seasons Randomizer</h1>
            <h2 className="text-center">Version: {this.props.version}</h2>
          </div>
          <div className="card-body">
            <h2><div className="text-center"><a href="/randomize">Click here to begin!</a></div></h2>
            <h3>About</h3>
            <p>This website will allow you to randomize an Oracle of Ages or Seasons ROM; in other words, this shuffles all item locations in the game, along with many other things such as seasons, dungeons, music, and more.</p>
            <p>This particular version of the randomizer is <b>Oracles-Randomizer-NG</b>, Stewmat's fork of the Oracles-Randomizer supporting advanced features such as keysanity and cross-items. Source code available <a href="https://github.com/Stewmath/Oracle-of-Seasons-Ages-Randomizer-Web-Interface">here</a>.
            </p>

            <h3>Randomizer forks</h3>
            <p>A number of different forks exist of the randomizer, which can cause some confusion. I recommend using one of the following:</p>
            <ul>
              <li>Oracles-Randomizer-NG <b>(this one!)</b>: An overhaul of Jangler's original randomizer by Stewmat, with advanced & experimental features such as cross-items, keysanity, music randomization, custom sprites, and more.</li>
              <li><a href="https://oracles-dev.gwaa.kiwi/generate">Oracles-Randomizer-NG-Plus</a>: A fork of Oracles-Randomizer-NG by Karafruit with more experimental features. Has most features from NG, but development has diverged at the time of writing.</li>
            </ul>

            <p>You may also be interested in these versions for their unique features:</p>
            <ul>
              <li>Oracles-Randomizer (the original): Written by Jangler, it is battle-tested and stable, but not receiving updates these days. However, it does support multiworld, unlike NG. Can be used through <a href="https://cemulate.github.io/oracles-randomizer-web/">cemulate's web interface</a>, or by <a href="https://github.com/jangler/oracles-randomizer/releases">running it locally.</a></li>
              <li>Entrance randomizer: An old fork of jangler's randomizer which randomizes all entrances and exits. Also accessible through <a href="https://cemulate.github.io/oracles-randomizer-web/">cemulate's web interface</a>.</li>
            </ul>

            <h3>Stuck?</h3>
            <p>Join the <a href="https://discord.gg/FcdGMWC">Oracles Discord</a> and hop into the #randomizer channel! There are several helpful people there that can help you out.</p>
          </div>
        </div>
      </div>
    )
  }
}

export default Home;
