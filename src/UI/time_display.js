import React from "react";
import Flatpickr from "react-flatpickr";
import { ToUTCDate, ToLocalDate } from "../common/dates";
import DatePickerConfig from "./flatpickr_config";

export default function TimeDisplay({ time, onTimeChange }) {
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
