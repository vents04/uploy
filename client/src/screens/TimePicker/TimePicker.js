import React, { Component } from 'react'

import { BiArrowBack } from 'react-icons/bi';
import { Link } from 'react-router-dom';

import './TimePicker.scss';

export default class TimePicker extends Component {

    state = {
        queryParams: {
            previousPage: "/",
            locationQuery: "",
            pickupDate: new Date(),
            returnData: new Date(new Date().setDate(new Date().getDate() + 7))
        },
        times: [],
        pickupTime: "",
        returnTime: ""
    }

    componentDidMount() {
        const params = new URLSearchParams(window.location.search)
        const queryParams = this.state.queryParams;
        if (params.get("previousPage")) queryParams.previousPage = params.get("previousPage");
        if (params.get("locationQuery")) queryParams.locationQuery = params.get("locationQuery");
        if (params.get("pickupDate") && params.get("returnDate")) {
            queryParams.pickupDate = new Date(params.get("pickupDate"));
            queryParams.returnDate = new Date(params.get("returnDate"));
        }
        this.setState({ queryParams });
        this.generateDefaultTimes();
    }

    generateDefaultTimes = () => {
        let times = [];
        for (let hours = 0; hours < 24; hours++) {
            for (let minutes = 0; minutes < 60; minutes += 30) {
                const time = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                times.push(time);
            }
        }
        this.setState({ times, pickupTime: times[24], returnTime: times[24] });
    }

    render() {
        return (
            <div>
                <Link to={`${this.state.queryParams.previousPage}?locationQuery=${this.state.queryParams.locationQuery}&pickupDate=${this.state.queryParams.pickupDate}&returnDate=${this.state.queryParams.returnDate}`}>
                    <BiArrowBack size={32} className="arrow-back" />
                </Link>
                <div className="section">
                    <p className="section-title">Choose pickup and return time</p>
                    <div className="time-input-section">
                        <p className="time-input-section-title">Pickup time:</p>
                        <select className="time-dropdown" value={this.state.pickupTime} onChange={(evt) => {
                            this.setState({ pickupTime: evt.target.value });
                        }}>
                            {
                                this.state.times.map((time) =>
                                    <option value={time}>{time}</option>
                                )
                            }
                        </select>
                    </div>
                    <div className="time-input-section">
                        <p className="time-input-section-title">Return time:</p>
                        <select className="time-dropdown" value={this.state.returnTime} onChange={(evt) => {
                            this.setState({ returnTime: evt.target.value });
                        }}>
                            {
                                this.state.times.map((time) =>
                                    <option value={time}>{time}</option>
                                )
                            }
                        </select>
                    </div>
                </div>
                <div className="search-bottom-bar-container">
                    <button className="search-bottom-bar-button">Find vehicles</button>
                </div>
            </div>
        )
    }
}
