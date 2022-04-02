import React, { Component } from 'react'

import { IoMdClose } from 'react-icons/io'
import { CURRENCY_TYPES, UNLOCK_TYPES, VEHICLE_TYPES } from '../../global';

import './PostVehicle.scss';

import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import ApiRequests from '../../classes/ApiRequests';

export default class PostVehicle extends Component {

  constructor(props) {
    super(props);
    this.uploadPhotosRef = React.createRef();
  }

  state = {
    title: "",
    description: "",
    model: "",
    type: VEHICLE_TYPES.CAR,
    seats: 4,
    amount: 10,
    unlockTypes: UNLOCK_TYPES.MANUAL,
    currency: CURRENCY_TYPES.EUR,
    pickupLocations: [],
    returnLocations: [],
    photos: [],
    error: "",
    showError: false,
  }

  readFileAsText = (file) => {
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(){
            resolve(fr.result);
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsDataURL(file);
    });
}

  publishVehicle = async () => {
    let finalPickupLocations = [];
    for(let location of this.state.pickupLocations) {
      const place = await this.getPlace(location.placeId);
      finalPickupLocations.push({
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
      })
    }
    let finalReturnLocations = [];
    for(let location of this.state.returnLocations) {
      const place = await this.getPlace(location.placeId);
      finalReturnLocations.push({
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
      })
    }
    let finalPhotos = [];
    console.log(this.state.photos);
    for (let photo of this.state.photos) {
      await this.readFileAsText(photo.photo).then((fileContent) => {
        finalPhotos.push({
          photo: fileContent,
        })
    });      
    }
    console.log(finalPhotos);
    const payload = {
      title: this.state.title,
      description: this.state.description,
      model: this.state.model,
      type: this.state.type,
      price: {
        amount: this.state.amount,
        currency: this.state.currency, 
      },
      pickupLocations: finalPickupLocations,
      returnLocations: finalReturnLocations,
      photos: finalPhotos,
    }
    if(this.state.type == VEHICLE_TYPES.CAR) {
      payload.seats = this.state.seats;
      payload.unlockTypes = this.state.unlockTypes;
    }
    ApiRequests.post("vehicle", {}, payload, true).then((response) => {
      console.log("published")
    }).catch((error) => {
      if (error.response) {
        this.setState({error: error.response.data.error, showError: true});
      } else if (error.request) {
        this.setState({error: "Response not returned", showError: true});
      } else {
        this.setState({error: "Request setting error", showError: true});
      }
    })
  }

  getPlace = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await ApiRequests.getPlace(id);
        resolve(response.data.results[0]);
      } catch(err) {
        this.setState({showError: true, error: err.message});
        resolve();
      }
    })
}

  render() {
    return (
      <>
        <div className="top-bar">
            <IoMdClose size={24} className="icon" />
            <p className="top-bar-text">Add a vehicle</p>
        </div>
        <div className="post-vehicle-container">
          <div className="post-vehicle-form">
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text">Title</p>
              <input type="text" className="post-vehicle-item-input" placeholder="Type here" onInput={(evt) => { 
                this.setState({title: evt.target.value, showError: false, error: ""});
              }}/>
            </div>
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text">Description</p>
              <textarea type="text" className="post-vehicle-item-input post-vehicle-item-textarea" placeholder="Type here" onInput={(evt) => { 
                this.setState({description: evt.target.value, showError: false, error: ""});
              }}/>
            </div>
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text">Model</p>
              <input type="text" className="post-vehicle-item-input" placeholder="Type here" onInput={(evt) => { 
                this.setState({model: evt.target.value, showError: false, error: ""});
              }}/>
            </div>
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text">Photos</p>
              <button className="action-button" style={{marginTop: "16px"}} onClick={() => {
                this.uploadPhotosRef.current.click();
              }}>Upload</button>
              <input type="file" hidden ref={this.uploadPhotosRef} onInput={(evt) => {
                const files = evt.target.files;
                const photos = this.state.photos;
                photos.push({photo: files[0]});
                this.setState({photos: photos}, () => {
                  console.log(this.state);
                });
              }} />
              {
                this.state.photos.map((photo, index) => 
                <div className="location">
                  <p className="location-text">{photo.photo.name}</p>
                  <IoMdClose size={24} className="icon" onClick={() => {
                    const photos = this.state.photos;
                    photos.splice(index, 1);
                    this.setState({photos: photos})
                  }}/>
                </div>
                )
              }
            </div>
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text">Vehicle type</p>
              <select className="post-vehicle-item-input" defaultValue={this.state.type} value={this.state.type}
              onChange={(evt) => {
                console.log(evt.target.value)
                this.setState({type: evt.target.value})
              }}>
                {
                  Object.values(VEHICLE_TYPES).map((type) => 
                    <option value={type}>{type.toLowerCase()}</option>
                  )
                }
              </select>
            </div>
            {
              this.state.type == VEHICLE_TYPES.CAR
              && <div className="post-vehicle-item">
                <p className="post-vehicle-item-text">Seats</p>
                <input type="number" className="post-vehicle-item-input" value={this.state.seats} onInput={(evt) => { 
                this.setState({seats: evt.target.value, showError: false, error: ""});
              }}/>
            </div> 
            }
            {
              this.state.type == VEHICLE_TYPES.CAR
              && <div className="post-vehicle-item">
                <p className="post-vehicle-item-text">Unlock types</p>
                <select className="post-vehicle-item-input" defaultValue={this.state.unlockTypes} value={this.state.unlockTypes}
              onChange={(evt) => {
                this.setState({unlockTypes: evt.target.value})
              }}>
                {
                  Object.values(UNLOCK_TYPES).map((type) => 
                    <option value={type}>{type.toLowerCase()}</option>
                  )
                }
              </select>
            </div> 
            }
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text">Price</p>
              <input type="number" className="post-vehicle-item-input" value={this.state.amount} onInput={(evt) => { 
                this.setState({amount: evt.target.value, showError: false, error: ""});
              }}/>
            </div> 
            <div className="post-vehicle-item">
                <p className="post-vehicle-item-text">Currency</p>
                <select className="post-vehicle-item-input" defaultValue={this.state.currency} value={this.state.currency}
              onChange={(evt) => {
                this.setState({currency: evt.target.value})
              }}>
                {
                  Object.values(CURRENCY_TYPES).map((currency) => 
                    <option value={currency}>{currency}</option>
                  )
                }
              </select>
            </div> 
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text" style={{marginBottom: "16px"}}>Pickup locations</p>
              <GooglePlacesAutocomplete 
                  apiKey='AIzaSyAYQnnCgQuzHGk6WMcbhtOPJHROn5vycE4'
                  selectProps={{
                    onChange: (value) => {
                      const locations = this.state.pickupLocations;
                      locations.push({
                        label: value.label,
                        placeId: value.value.place_id
                      });
                      this.setState({pickupLocations: locations});
                    },
                  }}/>
              {
                this.state.pickupLocations.length != 0
                ? <>
                  {
                    this.state.pickupLocations.map((location, index) => 
                      <div className="location">
                        <p className="location-text">{location.label}</p>
                        <IoMdClose size={24} className="icon" onClick={() => {
                          const locations = this.state.pickupLocations;
                          locations.splice(index, 1);
                          this.setState({pickupLocations: locations})
                        }}/>
                      </div>
                    )
                  }
                </>
                : <p className="notation" style={{marginTop: "16px"}}>No pickup locations added</p>
              }
            </div>
            <div className="post-vehicle-item">
              <p className="post-vehicle-item-text" style={{marginBottom: "16px"}}>Return locations</p>
              <GooglePlacesAutocomplete 
                  apiKey='AIzaSyAYQnnCgQuzHGk6WMcbhtOPJHROn5vycE4'
                  selectProps={{
                    onChange: (value) => {
                      const locations = this.state.returnLocations;
                      locations.push({
                        label: value.label,
                        placeId: value.value.place_id
                      });
                      this.setState({returnLocations: locations});
                    },
                  }}/>
              {
                this.state.returnLocations.length != 0
                ? <>
                  {
                    this.state.returnLocations.map((location, index) => 
                      <div className="location">
                        <p className="location-text">{location.label}</p>
                        <IoMdClose size={24} className="icon" onClick={() => {
                          const locations = this.state.returnLocations;
                          locations.splice(index, 1);
                          this.setState({returnLocations: locations})
                        }}/>
                      </div>
                    )
                  }
                </>
                : <p className="notation" style={{marginTop: "16px"}}>No return locations added</p>
              }
            </div>
            {
              this.state.showError
              && <p className="error-box" style={{width: '90%'}}>{this.state.error}</p>
            }
            <button className="action-button" style={{width: '90%', marginTop: '16px'}} onClick={this.publishVehicle}>Publish vehicle</button>
          </div>
        </div>
      </>
    )
  }
}
