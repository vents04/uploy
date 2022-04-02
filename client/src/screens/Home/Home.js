import React, { Component } from 'react'
import './Home.scss';
import Navbar from '../../components/Navbar/Navbar';
import logo from '../../../assets/img/bg-3.jpg';

export default class Home extends Component {
  render() {
    return (
      <>
        <Navbar />
        <div className="background-image-container">
          <div className="background-image" style={{
            backgroundImage: `url(${logo})` 
          }}/>
          <div className="search-bar-container">
            <p className="search-bar-text">Search for your next rental</p>
            <input type="text" className="search-bar" placeholder="Type here"/>
          </div>
        </div>
      </>
    )
  }
}
