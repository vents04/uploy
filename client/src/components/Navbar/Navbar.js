import React, { Component } from 'react'

import './Navbar.scss';

export default class Navbar extends Component {
  render() {
    return (
      <div className="navbar-container">
            <div className="navbar-logo-container">
                <div className="navbar-logo" />
                <p className="navbar-logo-text">Rent 'n go</p>
            </div>
      </div>
    )
  }
}
