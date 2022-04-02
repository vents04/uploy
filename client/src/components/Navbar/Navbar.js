import React, { Component } from 'react'

import './Navbar.scss';

export default class Navbar extends Component {

  state = {
    isAuthenticated: false,
    user: {
      firstName: "Testing",
      lastName: "User",
      profilePicture: null
    }
  }

  render() {
    return (
      <div className="navbar-container">
        <div className="navbar-logo-container">
            <div className="navbar-logo" />
            <p className="navbar-logo-text">Rent 'n go</p>
        </div>
        <div className="navbar-menu">
          {
            this.state.isAuthenticated
            ? <>
                {
                  this.state.user.profilePicture
                  ? <div className="profile-picture-container" style={{
                    backgroundImage: `url(${this.state.user.profilePicture})`
                  }}/>
                  : <div className="profile-picture-container">
                    <p className="profile-picture-initials">{this.state.user.firstName.charAt(0)}{this.state.user.lastName.charAt(0)}</p>
                  </div>
                }
            </>
            : <>
              <button className="action-button">Account</button>
            </>
          }
        </div>
      </div>
    )
  }
}
