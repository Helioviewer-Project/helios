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
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        month = month < 10 ? '0' + month : month;
        let day = date.getDate();
        day = day < 10 ? '0' + day : day;
        let hours = date.getHours();
        hours = hours < 10 ? '0' + hours : hours;
        let minutes = date.getMinutes();
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let seconds = date.getSeconds();
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    }
}

let timer = new TimeDisplay(Config.current_time_id);
export default timer;
