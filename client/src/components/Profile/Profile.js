import React, { Component } from 'react'
import ApiRequests from '../../classes/ApiRequests';
import Auth from '../../classes/Auth';

import './Profile.scss';

import { IoMdClose } from 'react-icons/io'
import { Link, Navigate } from 'react-router-dom';

export default class Profile extends Component {
  state = {
    isAuthenticated: true,
    user: null,
    vehicles: [],
    rides: [],
    showError: false,
    error: ""
  }
  componentDidMount() {
    this.checkAuthentication();
  }


  checkAuthentication = () => {
    const token = Auth.getToken();
    if(!token) {
      this.setState({ isAuthenticated: false });
      return;
    }
    ApiRequests.post("user/validate-token", {}, {}, true).then((response) => {
      this.setState({isAuthenticated: response.data.valid, user: response.data.user});
      if(response.data.valid) {
        this.getVehicles();
        this.getRides();
      }
    }).catch((error) => {
      console.log("auth", error);
      if (error.response) {
        this.setState({showError: true, error: error.response.data.error});
      } else if (error.request) {
        this.setState({showError: true, error: "Response not returned"});
      } else {
        this.setState({showError: true, error: "Request setting error"});
      }
    })
  }

  getVehicles = () => {
    ApiRequests.get("vehicle", {}, true).then((response) => {
      this.setState({vehicles: response.data.vehicles});
    }).catch((error) => {
      console.log("v", error);
      if (error.response) {
        this.setState({showError: true, error: error.response.data.error});
      } else if (error.request) {
        this.setState({showError: true, error: "Response not returned"});
      } else {
        this.setState({showError: true, error: "Request setting error"});
      }
    })
  }

  getRides = () => {
    ApiRequests.get("ride", {}, true).then((response) => {
      this.setState({rides: response.data.rides});
    }).catch((error) => {
      if (error.response) {
        this.setState({showError: true, error: error.response.data.error});
      } else if (error.request) {
        this.setState({showError: true, error: "Response not returned"});
      } else {
        this.setState({showError: true, error: "Request setting error"});
      }
    })
  }

  render() {
    if(!this.state.isAuthenticated) {
      return (
        <Navigate to="/" />
      )
    }
    return (
      <>
      <div className="top-bar">
            <IoMdClose size={24} className="icon" />
            <p className="top-bar-text">Profile</p>
      </div>
      {
        this.state.isAuthenticated && this.state.user
        && <div className="profile-container">
          {
            this.state.showError
            && <p className="error-box">{this.state.error}</p>
          }
          <p className="text">My vehicles</p>
          {
            this.state.vehicles.length > 0
            ? this.state.vehicles.map((vehicle, index) => 
              <div className="item-container" key={index}>
                <p className="item-title">{vehicle.title}</p>
              </div>
            )
            : <p className="notation" style={{margin: "0.5rem 0rem 1rem 0rem"}}>No vehicles found</p>
          }
          <p className="text">My rides</p>
          {
            this.state.rides.length > 0
            ? this.state.rides.map((ride, index) => 
            <Link to={"/ride?id=" + ride._id}>
              <div className="item-container" key={index}>
                <p className="item-as">
                  {
                    ride.userId == this.state.user._id
                    ? "As rider"
                    : "As lender"
                  }
                </p>
                <p className="item-title">{ride.vehicle.title}</p>
              </div>
            </Link>
            )
            : <p className="notation" style={{margin: "0.5rem 0rem 1rem 0rem"}}>No rides found</p>
          }
        </div>
      }
      </>
    )
  }
}
