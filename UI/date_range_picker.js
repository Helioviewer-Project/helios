import Config from '../Configuration.js';
import flatpickr from "flatpickr";

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

/**
 * UI component for selecting date range and cadence
 */
class DateRangePicker {
    /**
     * Constructs the date range picker
     *
     * @param {string} start_id ID of HTML element for the start input
     * @param {string} end_id ID of HTML element for the end input
     * @param {string} frame_input_id ID of HTML element for frame count picker
     */
    constructor(start_id, end_id, frame_input_id) {
        this._start = flatpickr(document.getElementById(start_id), DatePickerConfig);
        this._end = flatpickr(document.getElementById(end_id), DatePickerConfig);
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
     * Converts a UTC date to a local time.
     * Flatpickr expects dates to be conformed the current locale.
     * Internally helios uses UTC dates for everything.
     * When updating the dates in the datepicker, they must be converted from UTC to local time to be displayed correctly
     * @param {Date} date
     * @private
     */
    _toUTC(date) {
        let date_copy = new Date(date);
        date_copy.setMinutes(date_copy.getMinutes() - date.getTimezoneOffset());
        return date_copy;
    }

    _toLocal(date) {
        let date_copy = new Date(date);
        date_copy.setMinutes(date_copy.getMinutes() + date.getTimezoneOffset());
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
        let start = this._toUTC(this._start.selectedDates[0]);
        let end = this._toUTC(this._end.selectedDates[0]);
        let frames = parseFloat(this._frames.value);
        return {
            start: start,
            end: end,
            cadence: (((end - start) / frames) / 1000)
        };
    }

    /**
     * @typedef DatePickerValues
     * @type Object
     * @property {Date} start
     * @property {Date} end
     * @property {number} frames
     */
    /**
     * Sets the values of the date range picker
     * @param {DatePickerValues} values
     */
    SetValues(values) {
        let dates = [];
        if (values.start) {
            dates.push(this._toLocal(values.start));
        }
        if (values.end) {
            dates.push(this._toLocal(values.end));
        }
        this._start.setDate(dates[0])
        this._end.setDate(dates[1])
        if (values.frames) {
            this._frames.value = values.frames;
        }
    }
}

let datepicker = new DateRangePicker(
    Config.start_picker_id,
    Config.end_picker_id,
    Config.date_range_frames_id
);
export default datepicker;

