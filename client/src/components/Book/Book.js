import React, { Component } from 'react'

import './Book.scss';

export default class Book extends Component {
  render() {
    return (
      <div className="result">
          <img className="result-image" src={this.props.result.vehicle.photos[0].photo}/>
          <div className="result-content">
            <p className="result-title">{this.props.result.vehicle.title}</p>
            <div className="result-user-container">
                {
                  this.props.result.user.profilePicture
                  ? <div className="profile-picture-container" style={{
                    backgroundImage: `url(${this.props.result.user.profilePicture})`,
                    boxShadow: "3px 3px 3px #e7e7e7",
                    border: "1px solid #e7e7e7",
                  }} />
                  : <div className="profile-picture-container">
                    <p className="profile-picture-initials">{this.props.result.user.firstName.charAt(0)}{this.props.result.user.lastName.charAt(0)}</p>
                  </div>
                }
                <p className="result-user-names">{this.props.result.user.firstName} {this.props.result.user.lastName}</p>
            </div>
          </div>
      </div>
    )
  }
}
