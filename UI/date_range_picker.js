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
     * @param {string} cadence_input_id ID of HTML element for cadence picker
     */
    constructor(start_input_id, end_input_id, cadence_input_id) {
        this._start = document.getElementById(start_input_id);
        this._end = document.getElementById(end_input_id);
        this._cadence = document.getElementById(cadence_input_id);
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
        let start = new Date(this._start.value);
        let end = new Date(this._end.value);
        let cadence = this._cadence.value;
        return {
            start: start,
            end: end,
            cadence: cadence
        };
    }
}

let datepicker = new DateRangePicker(
    Config.date_range_start_id,
    Config.date_range_end_id,
    Config.date_range_cadence_id
);
export default datepicker;

