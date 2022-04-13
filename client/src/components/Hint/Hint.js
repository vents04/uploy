import React, { Component } from 'react'
import { IoIosBulb } from 'react-icons/io'

import './Hint.scss';

export default class Hint extends Component {
    render() {
        return (
            <div className="hint-container">
                <IoIosBulb size={32} className="hint-icon" />
                <p className="hint">{this.props.hint}</p>
            </div>
        )
    }
}
