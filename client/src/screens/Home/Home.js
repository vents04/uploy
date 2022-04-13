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
    locationQuery: "",
    paramsWereSet: false
  }

  componentDidMount() {
    const params = new URLSearchParams(window.location.search)
    const locationQuery = params.get("locationQuery");
    if (locationQuery && locationQuery.length > 0) this.setState({ locationQuery });
    this.setState({ paramsWereSet: true });
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
        {
          this.state.paramsWereSet
          && <SearchTopBar showBackArrow={false} locationQuery={this.state.locationQuery} />

        }
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
