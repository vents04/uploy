import React, { Component } from 'react'
import { Sentry } from 'react-activity';

import tesla from '../../../assets/img/tesla-2.webp';
import ApiRequests from '../../classes/ApiRequests';

import './Ride.scss';

export default class Ride extends Component {

    state = {
        key: "70c22efa-981f-406d-95d4-1c836e9ec23c"
    }

    unlock = () => {
        this.setState({showLoading: true});
        ApiRequests.post("smartcar/unlock/70c22efa-981f-406d-95d4-1c836e9ec23c", {}, {}, true).then((response) => {
            this.setState({showLoading: false});
        }).catch((error) => {
            if (error.response) {
                alert(error.response.data.error);
            } else if (error.request) {
                alert("Response not returned");
            } else {
                alert("Request setting error");
            }
        }).finally(() => {
            this.setState({showLoading: false});
        })
    }

  render() {
    return (
      <div className="ride-container">
          <p className="ride-title">Tesla Model S 2015</p>
          <div className="ride-image" style={{
              backgroundImage: `url(${tesla})`
          }}/>
          <button className="action-button" onClick={this.unlock}>
              {
                  this.state.showLoading
                  ? <Sentry size={24} />
                  : "Unlock"
              }
          </button>
      </div>
    )
  }
}
