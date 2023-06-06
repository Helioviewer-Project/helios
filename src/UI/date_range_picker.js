import {ToLocalDate, ToUTCDate} from "../common/dates.js";
import Flatpickr from "react-flatpickr";
import React, { useEffect, useState } from 'react';

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

function frames2cadence(start, end, frames) {
    return (((end - start) / frames) / 1000);
}


export default function DateRangePicker({currentRange}) {
    function updateCadence(e) {
        currentRange.cadence = frames2cadence(currentRange.start, currentRange.end, e.target.value);
    }
    return (
        [
            <label key={0} htmlFor="js-start-date-picker">Start Date &amp; Time</label>,
            <Flatpickr key={1} data-enable-time value={ToLocalDate(currentRange.start)} onChange={([date]) => currentRange.start = ToUTCDate(date)} />,

            <label key={2} htmlFor="js-end-date-picker">End Date &amp; Time</label>,
            <Flatpickr key={3} data-enable-time value={ToLocalDate(currentRange.end)} onChange={([date]) => currentRange.end = ToUTCDate(date)} />,

            <label key={4} htmlFor="js-date-range-frames" name="Number of images to download in this time range">Number of Frames</label>,
            <input key={5} id="js-date-range-frames" defaultValue={60} type="number" onChange={updateCadence} />
        ]
    )
}
