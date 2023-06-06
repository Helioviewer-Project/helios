import React from 'react'
import Flatpickr from 'react-flatpickr'
import {ToUTCDate, ToLocalDate} from '../common/dates'

/**
 * Configuration for flatpickr datepickers.
 * See https://flatpickr.js.org/options/
 */
const DatePickerConfig = {
    enableTime: true,
    enableSeconds: true,
    mode: "single",
    time_24hr: true
}

export default function TimeDisplay({time, onTimeChange}) {
    return (
        <h1 className="time-label">
            <Flatpickr
                className='scene-time'
                value={ToLocalDate(time)}
                onChange={([date]) => {
                    let utcDate = ToUTCDate(date);
                    onTimeChange(utcDate);
                }}
                options={DatePickerConfig}
                />
        </h1>
    );
}
