import React, { Component } from 'react'

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

import './Book.scss';

import ApiRequests from '../../classes/ApiRequests';
import { UNLOCK_TYPES, VEHICLE_TYPES } from '../../global';
import { IoIosCar, IoIosKey, IoMdArrowBack } from 'react-icons/io';
import { MdDirectionsBike, MdElectricScooter, MdOutlineAirlineSeatReclineNormal } from 'react-icons/md';
import { Link, Navigate } from 'react-router-dom';
import { Sentry } from 'react-activity';

export default class Book extends Component {

  state = {
    vehicle: null,
    pickupDate: null,
    pickupTime: null,
    returnDate: null,
    returnTime: null,
    pickupLocation: null,
    returnLocation: null,
    showLoading: false,
    calculatedPrice: 0,
    navigateToProfile: false
  }

  componentDidMount() {
    const queryParams = new URLSearchParams(window.location.search);
    const id = queryParams.get('id');
    const pickupDate = queryParams.get('pD');
    if(pickupDate) this.setState({pickupDate: pickupDate});
    const pickupTime = queryParams.get('pT');
    if(pickupTime) this.setState({pickupTime: pickupTime});
    const returnDate = queryParams.get('rD');
    if(returnDate) this.setState({returnDate: returnDate});
    const returnTime = queryParams.get('rT');
    if(returnTime) this.setState({returnTime: returnTime})
    this.getVehicle(id)
  }

  getVehicle = (id) => {
    ApiRequests.get(`vehicle/${id}`, {}, true).then((response) => {
      this.setState({vehicle: response.data.vehicle, pickupLocation: response.data.vehicle.pickupLocations[0].address, returnLocation: response.data.vehicle.returnLocations[0].address}, () => {
        this.calculatePrice()
      });
    }).catch((error) => {
      console.log(error)
      if (error.response) {
        alert(error.response.data.error);
      } else if (error.request) {
        alert("Response not returned");
      } else {
        alert("Request setting error");
      }
    })
  }

  postRide = () => {
    this.setState({showLoading: true});
    let finalPickupLocation = null;
    for(let pickupLocation of this.state.vehicle.pickupLocations) {
      if(pickupLocation.address == this.state.pickupLocation) {
        delete pickupLocation._id;
        finalPickupLocation = pickupLocation;
        break;
      }
    }
    let finalReturnLocation = null;
    for(let returnLocation of this.state.vehicle.returnLocations) {
      if(returnLocation.address == this.state.returnLocation) {
        delete returnLocation._id;
        finalReturnLocation = returnLocation;
        break;
      }
    }
    const pdt = new Date(this.state.pickupDate + "T" + this.state.pickupTime );
    const rdt = new Date(this.state.returnDate + "T" + this.state.returnTime );
    const payload = {
      vehicleId: this.state.vehicle._id,
      pickupLocation: finalPickupLocation,
      returnLocation: finalReturnLocation,
      plannedPickupDt: pdt,
      plannedReturnDt: rdt
    }
    ApiRequests.post("ride", {}, payload, true).then((response) => {
      this.setState({navigateToProfile: true});
    }).catch((error) => {
      if (error.response) {
        this.setState({ error: error.response.data.error, showError: true});
      } else if (error.request) {
        this.setState({ error: "Response not returned", showError: true});
      } else {
        this.setState({ error: "Request setting error", showError: true});
      }
    }).finally(() => {
      this.setState({showLoading: false})
    })
  }

  calculatePrice = () => {
    const price = this.state.vehicle?.price.amount;
    const pdt = new Date(this.state.pickupDate + "T" + this.state.pickupTime );
    const rdt = new Date(this.state.returnDate + "T" + this.state.returnTime );
    const calculatedPrice = parseFloat(((parseInt(rdt.getTime()) - parseInt(pdt.getTime())) / (1000 * 60 * 60 * 24)) * price).toFixed(2)
    this.setState({calculatedPrice: calculatedPrice})
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
            <Link to={"/search"}>
              <IoMdArrowBack size={24} className="icon" />
            </Link>
            <p className="top-bar-text">Book a vehicle</p>
        </div>
      <div className="page-container">
        <div className="page-content">
          {
            this.state.vehicle
            && <div className="vehicle-info">
              <div className="vehicle-type">
                {
                  this.state.vehicle.type == VEHICLE_TYPES.CAR
                  ? <IoIosCar className="vehicle-type-icon"/>
                  : this.state.vehicle.type == VEHICLE_TYPES.BIKE
                    ? <MdDirectionsBike className="vehicle-type-icon" />
                    : <MdElectricScooter className="vehicle-type-icon"/>
                }
                <p className="vehicle-type-text">{this.state.vehicle.type}</p>
              </div>
              <p className="vehicle-title">Porsche 911 Turbo S</p>
              <div className="carousel-container">
              <Carousel
                showIndicators={false}
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}>
                {
                    this.state.vehicle.photos.map((photo, index) => 
                        <div className="carousel-image" style={{
                            backgroundImage: `url(${photo.photo})`
                        }} />
                    )
                }
              </Carousel>  
              </div>     
              <p className="vehicle-description">This is some description</p>  
              {
                this.state.vehicle.type == VEHICLE_TYPES.CAR
                && <div className="inline" style={{
                  margin: "16px 0px"
                }}>
                <div className="car-info-item">
                  <IoIosKey className="car-info-item-icon"/>
                  <p className="car-info-item-text">{this.state.vehicle.unlockTypes} UNLOCK</p>
                </div>
                <div className="car-info-item">
                  <MdOutlineAirlineSeatReclineNormal className="car-info-item-icon"/>
                  <p className="car-info-item-text">{this.state.vehicle.seats} SEATS</p>
                </div>
              </div> 
              }
              <p className="search-bar-hint">From</p>
              <div className="inline">
                  <input type="date" className="search-bar" value={this.state.pickupDate} onChange={(evt) => {
                  this.setState({pickupDate: evt.target.value}, () => {
                    this.calculatePrice();
                  })
                  }}/>
                  <input type="time" className="search-bar" value={this.state.pickupTime} onChange={(evt) => {
                  this.setState({pickupTime: evt.target.value}, () => {
                    this.calculatePrice();
                  })
                  }}/>
              </div>
              <p className="search-bar-hint">To</p>
              <div className="inline">
                  <input type="date" className="search-bar" value={this.state.returnDate} onChange={(evt) => {
                  this.setState({returnDate: evt.target.value}, () => {
                    this.calculatePrice();
                  })
                  }}/>
                  <input type="time" className="search-bar" value={this.state.returnTime} onChange={(evt) => {
                  this.setState({returnTime: evt.target.value}, () => {
                    this.calculatePrice();
                  })
                  }}/>
              </div>
              <p className="search-bar-hint">Pickup location</p>
              <select className="post-vehicle-item-input" defaultValue={this.state.vehicle.pickupLocations[0].address} value={this.state.pickupLocation}
              onChange={(evt) => {
                this.setState({pickupLocation: evt.target.value})
              }}>
                {
                  this.state.vehicle.pickupLocations.map((location) => 
                    <option value={location.address}>{location.address}</option>
                  )
                }
              </select>
              <p className="search-bar-hint">Return location</p>
              <select className="post-vehicle-item-input" defaultValue={this.state.vehicle.returnLocations[0].address} value={this.state.returnLocation}
              onChange={(evt) => {
                this.setState({returnLocation: evt.target.value})
              }}>
                {
                  this.state.vehicle.returnLocations.map((location) => 
                    <option value={location.address}>{location.address}</option>
                  )
                }
              </select>
            </div>
        }
        </div>
        {
          this.state.vehicle
          && <div className="page-action-button-container">
          <button className="action-button" onClick={this.postRide}>{
            this.state.showLoading
            ? <Sentry size={12}/>
            : `Book for ${this.state.calculatedPrice} ${this.state.vehicle.price.currency}`
          }</button>
        </div>
        }
      </div>
      </>
    )
  }
}
