import React, { Component } from 'react'
import { GOOGLE_API_KEY } from '../../global';

import './Prediction.scss';

export default class Prediction extends Component {
    render() {
        return (
            <div className="prediction">
                <p className="prediction-text">{this.props.prediction.description}</p>
            </div >
        )
    }
}

