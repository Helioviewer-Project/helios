import Config from '../Configuration.js';
import Scene from '../Scene/scene.js';

/**
 * Animation controls allows for visualizing the 3js scene in time.
 * AnimationControls provides functions for updating the scene
 * in time.
 */
class AnimationControls {
    /**
     * Constructs animation controls
     *
     * @param {string} play_btn_id HTML ID for the play button
     * @param {string} pause_btn_id HTML ID for the pause button
     */
    constructor(play_btn_id, pause_btn_id) {
        this._play_btn = document.getElementById(play_btn_id);
        this._pause_btn = document.getElementById(pause_btn_id);
        this._fps_input = document.getElementById(Config.animation_fps_id);
        this._InitializeClickListeners();

        /**
         * Start time for the animation range
         * @private
         */
        this._start_time = new Date("2021-01-01T00:00:00Z");

        /**
         * End time for the animation range
         * @private
         */
        this._end_time = new Date("2021-01-30T00:00:00Z");

        /**
         * Current animation time
         * @private
         */
        this._current_time = new Date(this._start_time);

        /**
         * Time between each animation frame in seconds
         * @private
         */
        this._cadence = 3600 * 24;

        /**
         * Delay between each frame in milliseconds
         * @private
         */
        this._frame_delay = 1000;

        /**
         * Interval for the animation thread
         * @private
         */
        this._interval = 0;
    }

    /**
     * Add click listeners for play/pause buttons
     * @private
     */
    _InitializeClickListeners() {
        let animator = this;
        this._play_btn.addEventListener('click', () => {animator.Play();});
        this._pause_btn.addEventListener('click', () => {animator.Pause();});
    }

    /**
     * Sets the start/end animation times and the current time.
     */
    _InitializeAnimationRangeFromInputs() {
        this._current_time = Scene.GetTime();
        let range = Scene.GetTimeRange();
        this._start_time = range[0];
        this._end_time = range[1];
        // 1 frame / Frames per second = Seconds per frame
        // Seconds per frame * 1000 ms/s = milliseconds per frame
        // This can be reduced to 1000 / fps;
        this._frame_delay = (1000 / parseFloat(this._fps_input.value) );
        this._cadence = ((this._end_time - this._start_time) / parseFloat(document.getElementById(Config.date_range_frames_id).value)) / 1000;
    }

    /**
     * Begins the animation
     */
    Play() {
        // If play is clicked again, then stop the animation first, then re-initialize
        // so that new input values are picked up.
        this.Pause();
        this._InitializeAnimationRangeFromInputs();
        // Only start the animation if it's not already running
        if (this._interval == 0) {
            let animator = this;
            this._interval = setInterval(() => {animator._TickFrame();}, this._frame_delay);
        }
    }

    /**
     * Stops the animation
     */
    Pause() {
        clearInterval(this._interval);
        this._interval = 0;
    }

    /**
     * Sets the start time of the animation
     *
     * @param {Date} date Animation start time
     */
    SetStartTime(date) {
        this._start_time = date;
    }

    /**
     * Sets the animation's end time
     *
     * @param {Date} date End time of the animation
     */
    SetEndTime(date) {
        this._end_time = date;
    }

    /**
     * Sets the current animation time to a specific point
     *
     * @param {Date} date point in time to set the animation to.
     */
    SetTime(date) {
        this._current_time = date;
        this._UpdateScene();
    }

    /**
     * Sets the time to wait between each frame update
     *
     * @param {number} ms Number of milliseconds between each frame
     */
    SetFrameDelay(ms) {
        this._frame_delay = ms;
    }

    /**
     * Returns the current animation time
     */
    GetCurrentTime() {
        return this._current_time;
    }

    /**
     * Updates the scene with the current time;
     * @private
     */
    _UpdateScene() {
        Scene.SetTime(this._current_time);
    }

    /**
     * Animation frame tick, called to update to the next frame
     */
    _TickFrame() {
        this._current_time = this._GetNextFrameTime();
        this._UpdateScene();
    }

    /**
     * Gets the time for the next frame
     * @private
     */
    _GetNextFrameTime() {
        // Start with current time
        let nextTime = new Date(this._current_time);
        // Add cadence to seconds
        nextTime.setSeconds(nextTime.getSeconds() + this._cadence);
        // If nextTime is over end time, then go back to start time
        if (nextTime > this._end_time) {
            return new Date(this._start_time);
        } else {
            // Otherwise, return this as the next date
            return nextTime;
        }
    }
}

let animation_controller = new AnimationControls(Config.play_btn_id, Config.pause_btn_id);
export default animation_controller;

