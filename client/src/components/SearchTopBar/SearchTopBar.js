import React, { Component } from 'react'
import AnimateHeight from 'react-animate-height';
import { BiArrowBack } from 'react-icons/bi';
import ApiRequests from '../../classes/ApiRequests';
import Prediction from '../Prediction/Prediction';
import SearchBar from '../SearchBar/SearchBar';

import './SearchTopBar.scss';
import googleLogo from '../../../assets/img/google-logo.png';

export default class SearchTopBar extends Component {

    state = {
        containerHeight: 100,
        predictions: [],
        showBackArrow: false,
        showPredictionsRetrievalError: false
    }

    componentDidMount() {
        this.setState({ showBackArrow: this.props.showBackArrow });
    }

    toggleContainerHeight = (value) => {
        this.setState({ containerHeight: value });
    }

    toggleShowBackArrow = (value) => {
        this.setState({ showBackArrow: value });
    }

    searchPlacesAutocomplete = (query) => {
        ApiRequests.get(`maps/places-autocomplete?query=${query}`, {}, false).then((response) => {
            this.setState({ predictions: response.data.predictions, showPredictionsRetrievalError: false });
            if (this.state.containerHeight != "100%") this.toggleContainerHeight("100%");
            if (!this.state.showBackArrow) this.toggleShowBackArrow(true);
        }).catch((error) => {
            this.setState({ showPredictionsRetrievalError: true });
        })
    }

    render() {
        return (
            <AnimateHeight
                duration={500}
                height={this.state.containerHeight}
                className="search-top-bar-container"
            >
                <div className="search-top-bar-header">
                    {
                        this.state.showBackArrow
                        && <BiArrowBack size={24} className="search-top-bar-back-arrow" onClick={() => {
                            this.toggleShowBackArrow(false);
                            this.toggleContainerHeight(100);
                        }} />
                    }
                    <SearchBar showBackArrow={this.state.showBackArrow} toggleShowBackArrow={this.toggleShowBackArrow} toggleContainerHeight={this.toggleContainerHeight} searchPlacesAutocomplete={this.searchPlacesAutocomplete} />
                </div>
                <div className="search-top-bar-predictions">
                    {
                        this.state.predictions?.length > 0
                            ? <>
                                <div className="notation inline">Search results powered by <img className="google-logo" src={googleLogo} /></div>
                                {
                                    this.state.predictions.map((prediction) =>
                                        <Prediction key={prediction.place_id} prediction={prediction} />
                                    )
                                }
                            </>
                            : null
                    }
                    {
                        this.state.showPredictionsRetrievalError
                        && <p className="notation">We could not find any predictions because there was an error with our server. Please, check your network connection and try again.</p>
                    }
                </div>
            </AnimateHeight>
        )
    }
}
