import React, { Component } from 'react'

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { DateRange } from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';

import './DateRangePicker.scss';
import { BiArrowBack } from 'react-icons/bi';
import { Link } from 'react-router-dom';

export default class DateRangePicker extends Component {

    state = {
        ranges: [
            {
                startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
                endDate: new Date(new Date().setDate(new Date().getDate() + 8)),
                key: 'selection'
            }
        ],
        queryParams: {
            previousPage: "/",
            locationQuery: ""
        }
    }

    allowedInputRanges = [
        {
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 8)),
        }
    ]

    componentDidMount() {
        const params = new URLSearchParams(window.location.search)
        const queryParams = this.state.queryParams;
        if (params.get("previousPage")) queryParams.previousPage = params.get("previousPage");
        if (params.get("locationQuery")) queryParams.locationQuery = params.get("locationQuery");
        if (params.get("pickupDate") && params.get("returnDate")) {
            const ranges = [
                {
                    startDate: new Date(params.get("pickupDate")),
                    endDate: new Date(params.get("returnDate")),
                    key: 'selection'
                }
            ]
            this.setState({ ranges })
        }
        this.setState({ queryParams });
    }

    render() {
        return (
            <div>
                <Link>
                    <BiArrowBack size={32} className="arrow-back" />
                </Link>
                <div className="section">
                    <p className="section-title">When are you planning your ride?</p>
                    <DateRange
                        className="date-range-picker"
                        showDateDisplay={false}
                        showMonthAndYearPickers={false}
                        showMonthArrow={false}
                        showPreview={false}
                        months={1.75}
                        locale={rdrLocales.enGB}
                        direction="vertical"
                        scroll={{ enabled: true }}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 8))}
                        onChange={item => {
                            if (window.history.pushState) {
                                var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?pickupDate=' + item.selection.startDate + '&returnDate=' + item.selection.endDate + '&locationQuery=' + this.state.queryParams.locationQuery;
                                window.history.pushState({ path: newurl }, '', newurl);
                            }
                            this.setState({ ranges: [item.selection] })
                        }}
                        moveRangeOnFirstSelection={false}
                        ranges={this.state.ranges}
                        rangeColors={["#2666CF"]}
                    />
                </div>
                <div className="search-bottom-bar-container">
                    <Link style={{ width: '100%' }} to={`/time-picker?previousPage=/date-range-picker&locationQuery=${this.state.queryParams.locationQuery}&pickupDate=${this.state.ranges[0].startDate}&returnDate=${this.state.ranges[0].endDate}`}>
                        <button className="search-bottom-bar-button">Next</button>
                    </Link>
                </div>
            </div>
        )
    }
}
