import React, { Component } from 'react'

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { DateRange } from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';

import './DateRangePicker.scss';
import { BiArrowBack } from 'react-icons/bi';
import SearchBottomBar from '../../components/SearchBottomBar/SearchBottomBar';
import { ROOT_URLS } from '../../global';
import { Link } from 'react-router-dom';

export default class DateRangePicker extends Component {

    state = {
        ranges: [
            {
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                key: 'selection'
            }
        ],
        queryParams: {
            previousPage: "/rides",
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
        this.setState({ queryParams });
    }

    render() {
        return (
            <div>
                <Link to={`${this.state.queryParams.previousPage}?locationQuery=${this.state.queryParams.locationQuery}`}>
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
                        onChange={item => this.setState({ ranges: [item.selection] })}
                        moveRangeOnFirstSelection={false}
                        ranges={this.state.ranges}
                        rangeColors={["#2666CF"]}
                    />
                </div>
                <SearchBottomBar />
            </div>
        )
    }
}
