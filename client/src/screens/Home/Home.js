import React, { Component } from 'react'
import './Home.scss';
import Navbar from '../../components/Navbar/Navbar';
import logo from '../../../assets/img/bg-3.jpg';
import { Link } from "react-router-dom";
import ApiRequests from '../../classes/ApiRequests';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import cta from '../../../assets/img/cta.jpg';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import { MENUS } from '../../global';

export default class Home extends Component {

  state = {
    pickupDate: null,
    pickupTime: null,
    returnDate: null,
    returnTime: null,
    query: null,
    lat: 42.0119,
    lon: 23.0947,
    placeId: null,
    isAuthenticated: false,
  }

  componentDidMount() {
    this.checkAuthentication();

    const pickupDt = new Date();
    const returnDt = new Date(new Date().setDate(pickupDt.getDate() + 5));

    const pickupDate = pickupDt.toISOString().split('T')[0];
    const pickupTime = pickupDt.toTimeString().split(' ')[0];
    const returnDate = returnDt.toISOString().split('T')[0];
    const returnTime = returnDt.toTimeString().split(' ')[0];

    this.setState({
      pickupDate: pickupDate,
      pickupTime: pickupTime,
      returnDate: returnDate,
      returnTime: returnTime
    })
  }

  checkAuthentication = () => {
    ApiRequests.post("user/validate-token", {}, {}, true).then((response) => {
      this.setState({ isAuthenticated: response.data.valid });
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
      <>
        <Navbar />
        <div className="background-image-container">
          <div className="background-image" style={{
            backgroundImage: `url(${logo})`
          }} />
          <div className="search-bar-container">
            <p className="search-bar-text">Search for <br /> your next rental</p>
            <div className="search-input-container">
              <p className="search-bar-hint" style={{
                marginBottom: "8px"
              }}>Where at?</p>
              <GooglePlacesAutocomplete
                className="search-bar"
                apiKey='AIzaSyAYQnnCgQuzHGk6WMcbhtOPJHROn5vycE4'
                selectProps={{
                  onChange: (value) => {
                    this.setState({ placeId: value.value.place_id });
                  },
                }} />
              <p className="search-bar-hint" style={{
                marginTop: "8px"
              }}>From</p>
              <div className="inline">
                <input type="date" className="search-bar" value={this.state.pickupDate} onChange={(evt) => {
                  this.setState({ pickupDate: evt.target.value })
                }} />
                <input type="time" className="search-bar" value={this.state.pickupTime} onChange={(evt) => {
                  this.setState({ pickupTime: evt.target.value })
                }} />
              </div>
              <p className="search-bar-hint">To</p>
              <div className="inline">
                <input type="date" className="search-bar" value={this.state.returnDate} onChange={(evt) => {
                  this.setState({ returnDate: evt.target.value })
                }} />
                <input type="time" className="search-bar" value={this.state.returnTime} onChange={(evt) => {
                  this.setState({ returnTime: evt.target.value })
                }} />
              </div>
            </div>
            <Link
              style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}
              to={"/search?pD=" + this.state.pickupDate + "&pT=" + this.state.pickupTime + "&rD=" + this.state.returnDate + "&rT=" + this.state.returnTime + "&placeId=" + this.state.placeId}>
              <button className="action-button" style={{
                width: "90%",
                marginTop: "16px",
                padding: "16px"
              }}>Search</button>
            </Link>
          </div>
        </div>
        {
          this.state.isAuthenticated
          && <div className="become-lender-container" style={{
            backgroundImage: `url(${cta})`
          }}>
            <p className="become-lender-text">Add vehicle</p>
            <Link to="/add-vehicle">
              <button className="become-lender-button">Proceed</button>
            </Link>
          </div>
        }
        <BottomNavigation activeMenu={MENUS.DISCOVER} />
      </>
    )
  }
}
