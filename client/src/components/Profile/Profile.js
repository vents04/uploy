import React, { Component } from 'react'
import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';

import { IoMdClose } from 'react-icons/io'

export default class Profile extends Component {
  state = {
    isAuthenticated: false,
    user: null
  }
  componentDidMount() {
    this.checkAuthentication();
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
      <><div className="top-bar">
            <IoMdClose size={24} className="icon" />
            <p className="top-bar-text">Profile</p>
      </div>
      {
        this.state.isAuthenticated
        ?<div className="profile-container">
        {
          this.state.user.profilePicture
          ? <div className="profile-picture-container" style={{
            backgroundImage: `url(${this.state.user.profilePicture})`,
            boxShadow: "3px 3px 3px #e7e7e7",
            border: "1px solid #e7e7e7",
          }} />
          : <div className="profile-picture-container">
            <p className="profile-picture-initials">{this.state.user.firstName.charAt(0)}{this.state.user.lastName.charAt(0)}</p>
          </div>
        }
        <p className="modal-input-hint">First Name:</p>
          <input type="text" placeholder="Type here" className="modal-input"
          onInput={(evt) => {
              this.setState({FirstName: evt.target.value, showError: false, error: ""})
          }} defaultValue={this.state.user.firstName}/>
          <p className="modal-input-hint">Last Name:</p>
          <input type="text" placeholder="Type here" className="modal-input"
          onInput={(evt) => {
              this.setState({LastName: evt.target.value, showError: false, error: ""})
          }} defaultValue={this.state.user.lastName}/>
        <p className="modal-input-hint">Email:</p>
          <input type="text" placeholder="Type here" className="modal-input"
          onInput={(evt) => {
              this.setState({email: evt.target.value, showError: false, error: ""})
          }} defaultValue={this.state.user.email}/>
        </div>
        : null
      }
      </>
    )
  }
}
