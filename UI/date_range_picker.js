import Config from '../Configuration.js';
import flatpickr from "flatpickr";


/**
 * Configuration for flatpickr datepickers.
 * See https://flatpickr.js.org/options/
 */
const DatePickerConfig = {
    enableTime: true,
    enableSeconds: true,
    mode: "range"
}

/**
 * UI component for selecting date range and cadence
 */
class DateRangePicker {
    /**
     * Constructs the date range picker
     *
     * @param {string} range_input_id ID of HTML element for the start input
     * @param {string} frame_input_id ID of HTML element for frame count picker
     */
    constructor(range_input_id, frame_input_id) {
        this._range = flatpickr(document.getElementById(range_input_id), DatePickerConfig);
        this._frames = document.getElementById(frame_input_id);
    }

    /**
     * Converts a localized date (From flatpickr) to a UTC time.
     * Dates are returned in local time, but the datepicker is meant for UTC time.
     * So for example when I (US/Eastern) choose 12:00PM UTC, I am returned 12:00PM Eastern (which is 8am UTC, which is not what I intended to select);
     * This function applies the time zome offset to convert that 12:00PM Eastern into 12:00PM UTC.
     * The function is generic and works for all time zones.
     * @param {Date} date
     * @private
     */
    _toUTC(date) {
        let date_copy = new Date(date);
        date_copy.setMinutes(date_copy.getMinutes() - date.getTimezoneOffset());
        return date_copy;
    }

    /**
     * @typedef {Object} TimeRange
     * @property {Date} start
     * @property {Date} end
     * @property {number} cadence
     */
    /**
     * Returns the currently selected date/time range
     *
     * @returns {TimeRange}
     */
    GetDateRange() {
        let start = this._toUTC(this._range.selectedDates[0]);
        let end = this._toUTC(this._range.selectedDates[1]);
        let frames = parseFloat(this._frames.value);
        return {
            start: start,
            end: end,
            cadence: (((end - start) / frames) / 1000)
        };
    }
}

let datepicker = new DateRangePicker(
    Config.date_range_id,
    Config.date_range_frames_id
);
export default datepicker;

