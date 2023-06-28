import React from 'react';
import css from './common.css'
import CloseButton from './components/close_button';

type AnimationControlProps = {
    /**
     * Controls whether this component is currently visible
     */
    visible: boolean,
    onClose: () => void,
    /**
     * @returns Current time from the scene
     */
    GetSceneTime: () => Date,
    /**
     * @returns Gets a 2 element list with the first element being the earliest date in the scene, and max being the latest date in the scene
     */
    GetSceneTimeRange: () => Date[],
    /**
     * @returns Max frame count of all the sources in the scene
     */
    GetMaxFrameCount: () => number,
    /**
     * @returns Sets the time in the scene
     */
    SetSceneTime: (Date) => void
}

type AnimationControlState = {
    speed: number
}

/**
 * Animation controls allows for visualizing the 3js scene in time.
 * AnimationControls provides functions for updating the scene
 * in time.
 */
class AnimationControls extends React.Component<AnimationControlProps, AnimationControlState> {
    _start_time: Date;
    _end_time: Date;
    _current_time: Date;
    _cadence: number;
    _frame_delay: number;
    _interval: number;

    constructor(props: AnimationControlProps) {
        super(props);
        this.state = {
            speed: 15
        };

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
     * Sets the start/end animation times and the current time.
     */
    _InitializeAnimationRangeFromInputs() {
        this._current_time = this.props.GetSceneTime();
        let range = this.props.GetSceneTimeRange();
        this._start_time = range[0];
        this._end_time = range[1];
        // The delay between each frame is computed by inverting FPS to get
        // seconds per frame.
        // Animation uses SetInterval to create the animation, which requires
        // time in milliseconds.
        // 1 / Frames per second = Seconds per frame
        // Seconds per frame * 1000 ms/s = milliseconds per frame
        // This can be reduced to (1000ms/s) / fps => ms/f;
        let fps = this.state.speed;
        this._frame_delay = (1000 / fps);

        // Cadence is determined via the total number of frames available.
        // First, ask the scene for the frame count, then divide the time range
        // by that count to get the amount that time should move forward each frame.
        let frame_count = this.props.GetMaxFrameCount();
        let time_range_seconds = ((this._end_time.getTime() - this._start_time.getTime()) / 1000);
        this._cadence = time_range_seconds / frame_count;
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
            this._interval = window.setInterval(() => {animator._TickFrame();}, this._frame_delay);
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
     * Updates the scene with the current time;
     * @private
     */
    _UpdateScene() {
        this.props.SetSceneTime(this._current_time);
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

    render() {
        const visibilityClass = this.props.visible ? css.visible : css.invisible
        return <div aria-hidden={this.props.visible ? "false" : "true"} className={`${css.tab} ${visibilityClass}`}>
            <CloseButton onClose={this.props.onClose} />
            <label htmlFor="js-animation-speed">Frames Per Second</label>
            <input value={this.state.speed} onChange={(e) => this.setState({speed: parseFloat(e.target.value)})} id="js-animation-speed" type="number"/>
            <button onClick={() => this.Play()} id="js-play-btn">Play</button>
            <button onClick={() => this.Pause()} id="js-pause-btn">Pause</button>
        </div>
    }
}

export default AnimationControls;

