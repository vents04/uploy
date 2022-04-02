import React, { Component } from 'react'
import Login from '../Login/Login';
import Signup from '../Signup/Signup';

import './Navbar.scss';

export default class Navbar extends Component {

  state = {
    isAuthenticated: false,
    user: {
      firstName: "Testing",
      lastName: "User",
      profilePicture: null
    },
    showLogin: true,
    showSignup: false
  }

  closeAllModals = () => {
    this.setState({showLogin: false, showSignup: false});
  }

  toggleShowLogin = (state) => {
    this.setState({showLogin: state});
  }

  toggleShowSignup = (state) => {
    this.setState({showSignup: state});
  }

  render() {
    return (
      <div className="navbar-container">
        {
          this.state.showLogin
          && <Login showLogin={this.toggleShowLogin} showSignup={this.toggleShowSignup}/>
        }
        {
          this.state.showSignup
          && <Signup showSignup={this.toggleShowSignup} showLogin={this.toggleShowLogin}/>
        }
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
              <button className="action-button" onClick={() => {
                this.setState({showLogin: true})
              }}>Account</button>
            </>
          }
        </div>
      </div>
    )
  }
}
