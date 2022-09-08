import Config from '../Configuration.js';
import Scene from '../Scene/scene.js';

/**
 * Renders current scene time
 */
class TimeDisplay {
    /**
     * @param {string} html_id ID of html element to set scene time to
     */
    constructor(html_id) {
        this._el = document.getElementById(html_id);
        this._input = document.getElementById(Config.scene_time_input);

        let time = this;
        let el = this._el;
        Scene.RegisterTimeUpdateListener((date) => {
            el.textContent = time.GetFormattedTime(date);
        });

        this._RegisterInputListener();
    }

    _RegisterInputListener() {
        this._input.addEventListener('change', (e) => {
            // Add the "Z" to parse the date as UTC time.
            let date = new Date(e.target.value + "Z");
            Scene.SetTime(date);
        });
    }

    /**
     * Returns the formatted time for the given date
     * @param {Date} date Date to format
     */
    GetFormattedTime(date) {
        let date_str = date.toISOString();
        date_str = date_str.replace("T", " ");
        date_str = date_str.replace("Z", " ");
        return date_str.substr(0, 19);
    }
}

let timer = new TimeDisplay(Config.current_time_id);
export default timer;
