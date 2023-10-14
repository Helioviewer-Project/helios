import { ToLocalDate, ToUTCDate } from "../../../../common/dates";
import Flatpickr from "react-flatpickr";
import React, { useEffect, useId, useState } from "react";
import Input from "../../../components/input/input";
import input_css from "../../../components/input/input.css";

function frames2cadence(start, end, frames) {
    let cadence = (end - start) / frames / 1000;
    // Handle special case where cadence is 0 because end/start are the same.
    // While cadence should technically be 0, it means the parts of the application
    // that iterate from start to end will add 0 between each frame, effectively
    // causing infinite loops trying to iterate over start to end.
    if (cadence == 0) {
        return 1;
    }
    return cadence;
}

export default function DateRangePicker({ value, setValue }) {
    let currentRange = value;
    let [frameCount, setFrameCount] = useState(60);
    useEffect(() => {
        updateCadence(frameCount);
    }, []);
    function updateCadence(newFrameCount) {
        newFrameCount = parseFloat(newFrameCount);
        if (!isNaN(newFrameCount)) {
            currentRange.cadence = frames2cadence(
                currentRange.start,
                currentRange.end,
                newFrameCount
            );
            setValue(currentRange);
            setFrameCount(newFrameCount);
        } else {
            setFrameCount("");
        }
    }

    const startInputId = useId();
    const endInputId = useId();

    return (
        <>
            <div className={input_css.container}>
                <Flatpickr
                    id={startInputId}
                    className={input_css.input}
                    data-enable-time
                    options={{ time_24hr: true }}
                    value={ToLocalDate(currentRange.start)}
                    onChange={([date]) => {
                        currentRange.start = ToUTCDate(date);
                        setValue(currentRange);
                        updateCadence(frameCount);
                    }}
                />
                <label htmlFor={startInputId} className={input_css.label}>
                    Start
                </label>
            </div>
            <div className={input_css.container}>
                <Flatpickr
                    id={endInputId}
                    className={input_css.input}
                    data-enable-time
                    options={{ time_24hr: true }}
                    value={ToLocalDate(currentRange.end)}
                    onChange={([date]) => {
                        currentRange.end = ToUTCDate(date);
                        setValue(currentRange);
                        updateCadence(frameCount);
                    }}
                />
                <label htmlFor={endInputId} className={input_css.label}>
                    End
                </label>
            </div>
            <Input
                label="Number of steps"
                type="number"
                value={frameCount}
                onChange={updateCadence}
            />
        </>
    );
}
