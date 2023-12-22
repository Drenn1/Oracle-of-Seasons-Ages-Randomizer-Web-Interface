import React, { Component } from 'react';
import SPLink from './SpinningLink.gif'

class Spinner extends Component {
  render() {
    return (
      <div className="media" id="loading" >
        <div className="col"></div>
        <div className="col"><img className="align-self-st" src={SPLink} alt="" /></div>
        <div className="col"></div>
      </div>
    )
  }
}

export default Spinner;