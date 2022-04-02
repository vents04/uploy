import React, { Component } from 'react'

import './Login.scss';

import { IoMdClose } from 'react-icons/io';

export default class Login extends Component {

    state = {
        email: "",
        password: "",
        error: "",
        showError: false
    }

    login = () => {
        if (this.state.email === "" || this.state.password === "") {
            this.setState({
                error: "Please fill in all fields",
                showError: true
            })
        } else {
            // request
        }
    }

    render() {
        return (
            <div className="modal-background">
                <div className="modal-container">
                    <div className="modal-top-bar">
                        <p className="modal-title">Login</p>
                        <IoMdClose size={24} className="icon" onClick={() => {
                            this.props.showLogin(false);
                            this.props.showSignup(false);
                        }} />
                    </div>
                    <div className="modal-content">
                        <p className="modal-input-hint">Email:</p>
                        <input type="text" placeholder="Type here" className="modal-input"
                        onInput={(evt) => {
                            this.setState({email: evt.target.value, showError: false, error: ""})
                        }}/>
                        <p className="modal-input-hint">Password:</p>
                        <input type="password" placeholder="Type here" className="modal-input"
                        onInput={(evt) => {
                            this.setState({password: evt.target.value, showError: false, error: ""})
                        }}/>
                    </div>
                    <div className="modal-footer">
                        {
                            this.state.showError
                            && <p className="error-box">{this.state.error}</p>
                        }
                        <button className="action-button" onClick={this.login}>Continue</button>
                        <p className="modal-redirect-text" onClick={() => {
                            this.props.showLogin(false)
                            this.props.showSignup(true);
                        }}>Go to Signup</p>
                    </div>
                </div>
            </div>
        )
    }
}
