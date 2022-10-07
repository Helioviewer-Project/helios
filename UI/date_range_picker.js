import Config from '../Configuration.js';

/**
 * UI component for selecting date range and cadence
 */
class DateRangePicker {
    /**
     * Constructs the date range picker
     *
     * @param {string} start_input_id ID of HTML element for the start input
     * @param {string} end_input_id ID of HTML element for the end input
     * @param {string} frame_input_id ID of HTML element for frame count picker
     */
    constructor(start_input_id, end_input_id, frame_input_id) {
        this._start = document.getElementById(start_input_id);
        this._end = document.getElementById(end_input_id);
        this._frames = document.getElementById(frame_input_id);
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
        // TODO: Implement some validation so users can't specify
        //       something like every 1 second over 5 years
        // TODO: Make sure these dates have the correct UTC time. (Right now they most likely map to the user's local time)
        //       You can make them UTC time by forcing the string to be in the format "YYYY-MM-DDTHH:MM:SSZ"
        let start = new Date(this._start.value + "Z");
        let end = new Date(this._end.value + "Z");
        let frames = parseFloat(this._frames.value);
        return {
            start: start,
            end: end,
            cadence: (((end - start) / frames) / 1000)
        };
    }
}

let datepicker = new DateRangePicker(
    Config.date_range_start_id,
    Config.date_range_end_id,
    Config.date_range_frames_id
);
export default datepicker;

