import React, { Component } from 'react'
import { CURRENCY_TYPES } from '../../global';

import './Ride.scss';

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';

import tesla from '../../../assets/img/tesla.png';
import cta from '../../../assets/img/cta.jpg';
import { IoIosArrowForward } from 'react-icons/io';

export default class Ride extends Component {

    state = {
        ride: {
            vehicle: {
                title: "Porsche 911 Turbo S",
                photos: [{
                    photo: tesla
                }, {
                    photo: cta
                }]
            },
            price: {
                amount: 921,
                currency: CURRENCY_TYPES.EUR
            }
        }
    }

  render() {
    return (
        <div className="page-container">
            <div className="ride-container">
                <p className="vehicle-title">{this.state.ride.vehicle.title}</p>
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
            </div>
            <div className="action-button-container">
                <button className="action-button">Book for {this.state.ride.price.amount}{this.state.ride.price.currency}</button>
            </div>
        </div>
    )
  }
}
