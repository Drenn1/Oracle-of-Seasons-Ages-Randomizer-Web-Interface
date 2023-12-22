import React, { Component } from 'react'

class Header extends Component {
  render() {
    return (
      <header className="mb-4 header">
        <div className="row bg-info">
          <ul className="nav bg-info">
            <li className="nav-item">
              <a href="/" className="nav-link text-light">Home</a>
            </li>
            <li className="nav-item">
              <a href="/randomize" className="nav-link text-light">Generate Game</a>
            </li>
          </ul>
          <div className="col align-self-end">
            <h2 className="text-light text-right">OOS/A Web Randomizer</h2>
          </div>
        </div>
      </header>
    )
  }
}

export default Header;