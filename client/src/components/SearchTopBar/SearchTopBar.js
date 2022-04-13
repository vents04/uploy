import React, { Component } from 'react'
import AnimateHeight from 'react-animate-height';
import { BiArrowBack } from 'react-icons/bi';
import ApiRequests from '../../classes/ApiRequests';
import Prediction from '../Prediction/Prediction';
import SearchBar from '../SearchBar/SearchBar';

import './SearchTopBar.scss';
import googleLogo from '../../../assets/img/google-logo.png';
import { Link } from 'react-router-dom';

export default class SearchTopBar extends Component {

    state = {
        containerHeight: 100,
        predictions: [],
        showBackArrow: false,
        showPredictionsRetrievalError: false,
        query: "",
        paramsWereSet: false
    }

    componentDidMount() {
        console.log(this.props)
        if (this.props.locationQuery?.length > 0) {
            this.toggleContainerHeight("100%");
            this.searchPlacesAutocomplete(this.props.locationQuery);
            this.toggleShowBackArrow(true);
            this.setState({ query: this.props.locationQuery });
            this.setState({ paramsWereSet: true });
            return;
        }
        this.toggleShowBackArrow(this.props.showBackArrow);
        this.setState({ paramsWereSet: true });
    }

    toggleContainerHeight = (value) => {
        this.setState({ containerHeight: value });
    }

    toggleShowBackArrow = (value) => {
        this.setState({ showBackArrow: value });
    }

    searchPlacesAutocomplete = (query) => {
        this.setState({ query });
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
                    {
                        this.state.paramsWereSet
                        && <SearchBar locationQuery={this.state.query} showBackArrow={this.state.showBackArrow} toggleShowBackArrow={this.toggleShowBackArrow} toggleContainerHeight={this.toggleContainerHeight} searchPlacesAutocomplete={this.searchPlacesAutocomplete} />
                    }
                </div>
                <div className="search-top-bar-predictions">
                    {
                        this.state.predictions?.length > 0
                            ? <>
                                <div className="notation inline">Search results powered by <img className="google-logo" src={googleLogo} /></div>
                                {
                                    this.state.predictions.map((prediction) =>
                                        <Link to={`/date-range-picker?previousPage=/&locationQuery=${this.state.query}`}>
                                            <Prediction key={prediction.place_id} prediction={prediction} />
                                        </Link>
                                    )
                                }
                            </>
                            : <p className="notation">Unfortunately, we could not find any location for this search</p>
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
