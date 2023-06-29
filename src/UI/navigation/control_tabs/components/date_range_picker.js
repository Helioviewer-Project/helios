import {ToLocalDate, ToUTCDate} from "../../../../common/dates";
import Flatpickr from "react-flatpickr";
import React, { useEffect, useState } from 'react';
import Input from "../../../components/input/input";
import input_css from "../../../components/input/input.css";

function frames2cadence(start, end, frames) {
    return (((end - start) / frames) / 1000);
}

export default function DateRangePicker({value, setValue}) {
    let currentRange = value;
    let [frameCount, setFrameCount] = useState(60)
    useEffect(() => {
        updateCadence(frameCount);
    }, [])
    function updateCadence(newFrameCount) {
        newFrameCount = parseFloat(newFrameCount);
        if (!isNaN(newFrameCount)) {
            currentRange.cadence = frames2cadence(currentRange.start, currentRange.end, newFrameCount);
            setValue(currentRange);
            setFrameCount(newFrameCount);
        } else {
            setFrameCount("");
        }
    }
    return (
        <>
            <div className={input_css.container}>
                <Flatpickr className={input_css.input} data-enable-time value={ToLocalDate(currentRange.start)} onChange={([date]) => {currentRange.start = ToUTCDate(date); setValue(currentRange)}} />
                <label className={input_css.label}>Start Date &amp; Time</label>
            </div>
            <div className={input_css.container}>
                <Flatpickr className={input_css.input} data-enable-time value={ToLocalDate(currentRange.end)} onChange={([date]) => {currentRange.end = ToUTCDate(date); setValue(currentRange)}} />
                <label className={input_css.label}>End Date &amp; Time</label>
            </div>
            <Input label="Number of Frames" type="number" value={frameCount} onChange={updateCadence} />
        </>
    )
}
