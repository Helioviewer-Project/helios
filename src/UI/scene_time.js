import Config from '../Configuration.js';
import Scene from '../Scene/scene.js';
import {ToLocalDate, ToUTCDate} from "../common/dates.js";
import flatpickr from "flatpickr";
import HTML from '../common/html.js';

/**
 * Configuration for flatpickr datepickers.
 * See https://flatpickr.js.org/options/
 */
const DatePickerConfig = {
    enableTime: true,
    enableSeconds: true,
    mode: "single",
    time_24hr: true,
    onChange: function (selectedDates) {
        let date = ToUTCDate(selectedDates[0]);
        Scene.SetTime(date);
    },
    disableMobile: true
}

/**
 * Renders current scene time
 */
class TimeDisplay {
    constructor() {
        let input = HTML.scene_time_input;
        this._input = flatpickr(input, DatePickerConfig);

        let time = this;
        Scene.RegisterTimeUpdateListener((date) => {
            time._input.setDate(ToLocalDate(date));
        });
    }
}

let timer = new TimeDisplay();
export default timer;
