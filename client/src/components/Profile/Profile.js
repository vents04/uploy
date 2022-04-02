import React, { Component } from 'react'

import { IoMdClose } from 'react-icons/io'

export default class Profile extends Component {
  render() {
    return (
      <div className="top-bar">
            <IoMdClose size={24} className="icon" />
            <p className="top-bar-text">Profile</p>
      </div>
    )
  }
}
