import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';

class Footer extends Component {
  render() {
    return (
      <>
        {/* Padding for footer */}
        <div style={{height: '60px'}}></div>

        <footer className="fixed-bottom bg-info text-light" >
          <Container fluid>
            <Row>
              <Col className="text-start">
                Version: {this.props.version}
              </Col>
              <Col className="text-end">
                Coded by Stewmat, jangler, jaysee87
              </Col>
            </Row>
          </Container>
        </footer>
      </>
    )
  }
}

Footer.propTypes = {
  version: PropTypes.string.isRequired
}

export default Footer;
