import React, { Component } from 'react'

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

import './Ride.scss';

import ApiRequests from '../../classes/ApiRequests';
import { UNLOCK_TYPES, VEHICLE_TYPES } from '../../global';
import { IoIosCar, IoIosKey, IoMdArrowBack } from 'react-icons/io';
import { MdDirectionsBike, MdElectricScooter, MdOutlineAirlineSeatReclineNormal } from 'react-icons/md';
import { Link, Navigate } from 'react-router-dom';
import { Sentry } from 'react-activity';

export default class Ride extends Component {

  state = {
    ride: null,
    showLoading: false,
    navigateToProfile: false
  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id');
    if(!id) this.setState({navigateToProfile: true});
    this.getRide(id)
  }

  getRide = (id) => {
    ApiRequests.get(`ride/${id}`, {}, true).then((response) => {
      this.setState({ride: response.data.ride});
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

  gotCarFromClient = () => {
    ApiRequests.put(`ride/${this.state.ride._id}/lender-update`, {}, {
        status: "FINISHED"
    }, true).then((response) => {
        alert("Car marked as got");
        this.getRide(this.state.ride._id);
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

  gotCarFromLender = () => {
    ApiRequests.put(`ride/${this.state.ride._id}/client-update`, {}, {
        status: "ONGOING"
    }, true).then((response) => {
        alert("Car marked as got");
        this.getRide(this.state.ride._id);
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

  openVehiclePage = () => {
      alert("Vehicle page is still under development");
  }

  render() {
    if(this.state.navigateToProfile) {
      return (
        <Navigate to="/profile" />
      )
    }
    return (
      <>
      <div className="top-bar">
            <Link to={"/profile"}>
              <IoMdArrowBack size={24} className="icon" />
            </Link>
            <p className="top-bar-text">Ride</p>
        </div>
      <div className="page-container">
        <div className="page-content">
          {
            this.state.ride?.vehicle
            && <div className="vehicle-info">
              <div className="vehicle-type">
                {
                  this.state.ride.vehicle.type == VEHICLE_TYPES.CAR
                  ? <IoIosCar className="vehicle-type-icon"/>
                  : this.state.ride.vehicle.type == VEHICLE_TYPES.BIKE
                    ? <MdDirectionsBike className="vehicle-type-icon" />
                    : <MdElectricScooter className="vehicle-type-icon"/>
                }
                <p className="vehicle-type-text">{this.state.ride.vehicle.type}</p>
              </div>
              <p className="vehicle-title">Porsche 911 Turbo S</p>
              <div className="carousel-container">
              <Carousel
                showIndicators={false}
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}>
                {
                    this.state.ride.vehicle.photos.map((photo, index) => 
                        <div className="carousel-image" style={{
                            backgroundImage: `url(${photo.photo})`
                        }} />
                    )
                }
              </Carousel>  
              </div>     
              <p className="vehicle-description">This is some description</p>  
              {
                this.state.ride.vehicle.type == VEHICLE_TYPES.CAR
                && <div className="inline" style={{
                  margin: "16px 0px"
                }}>
                <div className="car-info-item">
                  <IoIosKey className="car-info-item-icon"/>
                  <p className="car-info-item-text">{this.state.ride.vehicle.unlockTypes} UNLOCK</p>
                </div>
                <div className="car-info-item">
                  <MdOutlineAirlineSeatReclineNormal className="car-info-item-icon"/>
                  <p className="car-info-item-text">{this.state.ride.vehicle.seats} SEATS</p>
                </div>
              </div> 
              }
              <p className="search-bar-hint">From</p>
              <div className="inline">
                  <p className="text">{new Date(this.state.ride.plannedPickupDt).toLocaleString()}</p>
              </div>
              <p className="search-bar-hint">To</p>
              <div className="inline">
                <p className="text">{new Date(this.state.ride.plannedReturnDt).toLocaleString()}</p>
              </div>
              <p className="search-bar-hint">Pickup location</p>
              <select className="post-vehicle-item-input" defaultValue={this.state.ride.pickupLocation.address}>
                <option value={this.state.ride.pickupLocation.address}>{this.state.ride.pickupLocation.address}</option>
              </select>
              <p className="search-bar-hint">Return location</p>
              <select className="post-vehicle-item-input" defaultValue={this.state.ride.returnLocation.address}>
                <option value={this.state.ride.returnLocation.address}>{this.state.ride.returnLocation.address}</option>
              </select>
            </div>
        }
        </div>
        {
            this.state.ride &&
        <div className="page-action-button-container">
          <button className="action-button" onClick={() => {
              this.state.ride.status == "AWAITING" 
              && new Date(this.state.ride.plannedPickupDt).getTime() < new Date().getTime()
              && !this.state.ride.isLender
              ? this.gotCarFromLender()
              : this.state.ride.status == "ONGOING"
                  && new Date(this.state.ride.plannedReturnDt).getTime() < new Date().getTime()
                  && this.state.ride.isLender
                  ? this.gotCarFromClient()
                  : this.openVehiclePage()
          }}>{
            this.state.ride.status == "AWAITING" 
            && new Date(this.state.ride.plannedPickupDt).getTime() < new Date().getTime()
            && !this.state.ride.isLender
            ? "I got the car"
            : this.state.ride.status == "ONGOING"
                && new Date(this.state.ride.plannedReturnDt).getTime() < new Date().getTime()
                && this.state.ride.isLender
                ? "I got the car back"
                : "Open vehicle"
          }</button>
        </div>
        }
      </div>
      </>
    )
  }
}
