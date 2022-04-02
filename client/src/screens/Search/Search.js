import React, { Component } from 'react'
import { IoMdArrowBack, IoMdClose } from 'react-icons/io';

import './Search.scss';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { Link } from 'react-router-dom';
import ApiRequests from '../../classes/ApiRequests';
import Result from '../../components/Result/Result';

export default class Search extends Component {

    state = {
        pickupDate: null,
        pickupTime: null,
        returnDate: null,
        returnTime: null,
        place: {
            autocompleteValue: null,
            placeId: null,
            lat: null,
            lon: null,
            label: null
        },
        results: []
    }

    componentDidMount() {
        const queryParams = new URLSearchParams(window.location.search);
        const pickupDate = queryParams.get('pD');
        if(pickupDate) this.setState({pickupDate: pickupDate});
        const pickupTime = queryParams.get('pT');
        if(pickupTime) this.setState({pickupTime: pickupTime});
        const returnDate = queryParams.get('rD');
        if(returnDate) this.setState({returnDate: returnDate});
        const returnTime = queryParams.get('rT');
        if(returnTime) this.setState({returnTime: returnTime})
        const placeId = queryParams.get('placeId');
        if(placeId) {
            console.log("sdsdsd")
            this.getPlace(placeId);
        }
    }

    getPlace = (id) => {
        ApiRequests.getPlace(id).then((response) => {
            let place = this.state.place;
            place.lat = response.data.results[0].geometry.location.lat;
            place.lon = response.data.results[0].geometry.location.lng;
            place.label = response.data.results[0].formatted_address;
            this.setState({place: place}, () => {
                this.search();
            });
        }).catch((error) => {
            console.log(error);
          this.setState({
              place: {
                  label: null,
                  lat: null,
                  lon: null,
                  placeId: null
              }
          })
        })
    }

    search = () => {
        const pdt = new Date(this.state.pickupDate + "T" + this.state.pickupTime );
        const rdt = new Date(this.state.returnDate + "T" + this.state.returnTime );
        ApiRequests.get(`vehicle/search?pdt=${pdt.getTime()}&rdt=${rdt.getTime()}&lat=${this.state.place.lat}&lon=${this.state.place.lon}`).then((response) => {
            this.setState({results: response.data.results})
        }).catch((error) => {
            throw new Error(error)
        })
    }

    render() {
        return (
            <>
                <div className="top-bar">
                    <Link to={"/"}>
                        <IoMdArrowBack size={24} className="icon"/>
                    </Link>
                    <p className="top-bar-text">Search vehicles</p>
                </div>
                <div className="search-container">
                    <GooglePlacesAutocomplete 
                        apiKey='AIzaSyAYQnnCgQuzHGk6WMcbhtOPJHROn5vycE4'
                        selectProps={{
                            placeholder: this.state.place.label,
                            onChange: (value) => {
                                console.log("d",value)
                                let place = this.state.place;
                                place.placeId = value.value.place_id;
                                place.autocompleteValue = value;
                                this.setState({place: place}, () => {
                                    this.getPlace(place.placeId);
                                });
                            },
                        }}/>
                    <p className="search-bar-hint" style={{
                        marginTop: "16px"
                    }}>From</p>
                    <div className="inline">
                        <input type="date" className="search-bar" value={this.state.pickupDate} onChange={(evt) => {
                        this.setState({pickupDate: evt.target.value})
                        }}/>
                        <input type="time" className="search-bar" value={this.state.pickupTime} onChange={(evt) => {
                        this.setState({pickupTime: evt.target.value})
                        }}/>
                    </div>
                    <p className="search-bar-hint">To</p>
                    <div className="inline">
                        <input type="date" className="search-bar" value={this.state.returnDate} onChange={(evt) => {
                        this.setState({returnDate: evt.target.value})
                        }}/>
                        <input type="time" className="search-bar" value={this.state.returnTime} onChange={(evt) => {
                        this.setState({returnTime: evt.target.value})
                        }}/>
                    </div>
                </div>
                <div className="results-container">
                    <p className="results-title">Matched vehicles</p>
                    {
                        this.state.results.length > 0
                        ? this.state.results.map((result) =>
                            <Result result={result} />
                        )
                        : <p className="notation">No vehicles found</p>
                    }
                </div>
            </>
        )
    }
}
