import React, { Component } from 'react'

import { IoMdClose } from 'react-icons/io'

import './PostVehicle.scss';

export default class PostVehicle extends Component {
  render() {
    return (
      <>
        <div className="top-bar">
            <IoMdClose size={24} className="icon" />
            <p className="top-bar-text">Add a vehicle</p>
        </div>
        <div className="post-vehicle-container">
          
        </div>
      </>
    )
  }
}
