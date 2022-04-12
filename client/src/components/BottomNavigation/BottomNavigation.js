import React, { Component } from 'react'

import { items } from './BottomNavigationData';

export default class BottomNavigation extends Component {

    render() {
        return (
            <div className="bottom-navigation-container">
                {
                    items.map((item, index) =>
                        <div className="bottom-navigation-item" key={index}>
                            <div className="bottom-navigation-item-icon">
                                {item.icon}
                            </div>
                            <div className="bottom-navigation-item-title">
                                {item.title}
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}
