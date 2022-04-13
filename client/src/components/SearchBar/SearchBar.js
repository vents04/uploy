import React, { Component } from 'react'

import { IoIosSearch } from 'react-icons/io'

import "./SearchBar.scss";

export default class SearchBar extends Component {

    state = {
        containerHeightUpdated: false,
        showBackArrowUpdated: false,
        query: ""
    }

    render() {
        return (
            <div className="search-bar">
                {
                    !this.props.showBackArrow
                    && <IoIosSearch size={24} className="search-bar-icon" />
                }
                <input type="text" placeholder="Where are you headed to?" className="search-bar-input"
                    onFocus={() => {
                        if (this.state.query.length > 0) {
                            this.props.toggleContainerHeight("100%");
                            this.props.toggleShowBackArrow(true);
                        }
                    }}
                    onChange={(evt) => {
                        if (!this.state.containerHeightUpdated) {
                            this.props.toggleContainerHeight("100%");
                            this.setState({ containerHeightUpdated: true });
                        }
                        if (!this.state.showBackArrowUpdated) {
                            this.props.toggleShowBackArrow(true);
                            this.setState({ showBackArrowUpdated: true });
                        }
                        this.setState({ query: evt.target.value }, () => {
                            if (this.state.query.length > 0) this.props.searchPlacesAutocomplete(this.state.query);
                        });
                    }} />
            </div>
        )
    }
}
