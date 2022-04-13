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
import SearchTopBar from '../../components/SearchTopBar/SearchTopBar';

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
        <SearchTopBar showBackArrow={false} />
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
