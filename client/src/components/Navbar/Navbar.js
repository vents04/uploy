import React, { Component } from 'react'
import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';
import Login from '../Login/Login';
import Signup from '../Signup/Signup';

import './Navbar.scss';

export default class Navbar extends Component {

  state = {
    isAuthenticated: false,
    user: {},
    showLogin: false,
    showSignup: false
  }

  componentDidMount() {
    this.checkAuthentication();
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

  checkAuthentication = () => {
    const token = Auth.getToken();
    if(!token) return;
    ApiRequests.post("user/validate-token", {}, {}, true).then((response) => {
      this.setState({isAuthenticated: response.data.valid, user: response.data.user});
    }).catch((error) => {
      if (error.response) {
        alert(error.response.data.error);
      } else if (error.request) {
        alert("Response not returned");
      } else {
        alert("Request setting error");
      }
    })
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
                    backgroundImage: `url(${this.state.user.profilePicture})`,
                    boxShadow: "3px 3px 3px #e7e7e7",
                    border: "1px solid #e7e7e7",
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
