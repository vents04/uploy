import React from 'react'

import { IoIosSearch } from 'react-icons/io';
import { FaRoad } from 'react-icons/fa';
import { BiCar } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';

import './BottomNavigation.scss';
import { MENUS } from '../../global';
import { Link } from 'react-router-dom';

export default class BottomNavigation extends React.Component {

    iconSize = 24;
    iconColor = "#262626";
    iconActiveColor = "#2666CF";

    items = [
        {
            title: "Discover",
            icon: <IoIosSearch size={this.iconSize} color={
                this.props.activeMenu == MENUS.DISCOVER ? this.iconActiveColor : this.iconColor
            } />
        },
        {
            title: "Rides",
            icon: <FaRoad size={this.iconSize} color={
                this.props.activeMenu == MENUS.RIDES ? this.iconActiveColor : this.iconColor
            } />
        },
        {
            title: "Vehicles",
            icon: <BiCar size={this.iconSize} color={
                this.props.activeMenu == MENUS.VEHICLES ? this.iconActiveColor : this.iconColor
            } />
        },
        {
            title: "Profile",
            icon: <CgProfile size={this.iconSize} color={
                this.props.activeMenu == MENUS.PROFILE ? this.iconActiveColor : this.iconColor
            } />
        },
    ]

    routes = {
        "Discover": "/",
        "Rides": "/rides",
        "Vehicles": "/vehicles",
        "Profile": "/profile",
    }

    render() {
        return (
            <div className="bottom-navigation-container">
                {
                    this.items.map((item, index) =>
                        <div className="bottom-navigation-item" key={index}>
                            <Link to={this.routes[item.title]} className="bottom-navigation-item-link">
                                {item.icon}
                                <div className="bottom-navigation-item-title" style={{
                                    fontFamily: this.props.activeMenu == item.title.toUpperCase() ? "Main Black" : "Main Bold"
                                }}>
                                    {item.title}
                                </div>
                            </Link>
                        </div>
                    )
                }
            </div>
        )
    }
}
