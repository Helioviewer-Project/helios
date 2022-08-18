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

        let time = this;
        let el = this._el;
        Scene.RegisterTimeUpdateListener((date) => {
            el.textContent = time.GetFormattedTime(date);
        });
    }

    /**
     * Returns the formatted time for the given date
     * @param {Date} date Date to format
     */
    GetFormattedTime(date) {
        let iso = date.toISOString();
        iso = iso.replace("T", " ");
        iso = iso.substr(0, 19);
        console.log(iso);
        return iso;
    }
}

let timer = new TimeDisplay(Config.current_time_id);
export default timer;
