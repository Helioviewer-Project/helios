import React, { useEffect, useState } from "react";
import Flatpickr from "react-flatpickr";
import { ToUTCDate, ToLocalDate } from "@common/dates";
import DatePickerConfig from "./flatpickr_config";

interface TimeDisplayProps {
    /**
     * Callback executed when this component sets the new time.
     */
    onTimeChange: (date: Date) => void;

    /**
     * Listener function to register when time changes externally.
     * The callback is provided.
     * When the callback is executed, this component will update to the new time.
     * @param fn
     */
    sceneListener: (fn: (date: Date) => void) => void;
}

export default function TimeDisplay({
    onTimeChange,
    sceneListener,
}: TimeDisplayProps) {
    let [time, setTime] = useState(new Date());
    // Effected executed once when component renders. Registers the listener
    useEffect(() => {
        sceneListener((date: Date) => {
            setTime(date);
        });
    }, []);
    return (
        <h1 className="time-label">
            <Flatpickr
                className="scene-time"
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
