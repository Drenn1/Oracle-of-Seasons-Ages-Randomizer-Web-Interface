import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Footer extends Component {
  render() {
    return (
      <footer className="footer fixed-bottom">
        <div className="container-fluid bg-info text-light align-middle">
          Randomizer ({this.props.version}) by jangler, Interface (v2.0.2) by jaysee87
        </div>
    </footer>
    )
  }
}

Footer.propTypes = {
  version: PropTypes.string.isRequired
}

export default Footer;