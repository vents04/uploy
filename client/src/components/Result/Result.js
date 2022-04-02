import React, { Component } from 'react'

import './Result.scss';

import tesla from '../../../assets/img/tesla-2.webp';

export default class Result extends Component {

    state = {
        vehicle: {
            title: "Porsche 911 Turbo S 2022",
            user: {
                firstName: "John",
                lastName: "Doe",
                profilePicture: null
            },
            photos: [""]
        }
    }

  render() {
    return (
      <div className="result">
          <img className="result-image" src={tesla}/>
          <div className="result-content">
            <p className="result-title">{this.state.vehicle.title}</p>
            <div className="result-user-container">
                {
                  this.state.vehicle.user.profilePicture
                  ? <div className="profile-picture-container" style={{
                    backgroundImage: `url(${this.state.vehicle.user.profilePicture})`,
                    boxShadow: "3px 3px 3px #e7e7e7",
                    border: "1px solid #e7e7e7",
                  }} />
                  : <div className="profile-picture-container">
                    <p className="profile-picture-initials">{this.state.vehicle.user.firstName.charAt(0)}{this.state.vehicle.user.lastName.charAt(0)}</p>
                  </div>
                }
                <p className="result-user-names">{this.state.vehicle.user.firstName} {this.state.vehicle.user.lastName}</p>
            </div>
          </div>
      </div>
    )
  }
}
