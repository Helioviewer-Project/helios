import Config from '../Configuration.js';
import {ToLocalDate, ToUTCDate} from "../common/dates.js";
import flatpickr from "flatpickr";
import HTML from "../common/html.js";

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
        let default_start_date = ToLocalDate(new Date());
        default_start_date.setDate(default_start_date.getDate() - 1); // yesterday
        this._start = flatpickr(HTML.start_time_input, Object.assign({defaultDate: default_start_date}, DatePickerConfig));
        default_start_date.setDate(default_start_date.getDate() + 1); // today
        this._end = flatpickr(HTML.end_time_input, Object.assign({defaultDate: default_start_date}, DatePickerConfig));
        this._frames = HTML.num_frames_input;
        this._frames.value = 120;
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
        let start = ToUTCDate(this._start.selectedDates[0]);
        let end = ToUTCDate(this._end.selectedDates[0]);
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
            dates.push(ToLocalDate(values.start));
        }
        if (values.end) {
            dates.push(ToLocalDate(values.end));
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

