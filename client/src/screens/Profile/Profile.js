import React, { Component } from 'react'

export default class Profile extends Component {

    componentDidMount() {
        this._isMounted = true;
        window.onpopstate = (evt) => {
            console.log(window.history);
        }
    }

    render() {
        return (
            <div>Profile</div>
        )
    }
}
