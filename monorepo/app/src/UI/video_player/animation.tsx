import React from "react";
import css from "./animation.css";
import Input from "../components/input/input";
import { MoviePlayerFacade } from "./movie_player_facade";

type AnimationControlProps = {
    /**
     * Controls whether this component is currently visible
     */
    visible: boolean;
    onClose: () => void;
    /**
     * @returns Current time from the scene
     */
    GetSceneTime: () => Date;
    /**
     * @returns Gets a 2 element list with the first element being the earliest date in the scene, and max being the latest date in the scene
     */
    GetSceneTimeRange: () => Date[];
    /**
     * @returns Max frame count of all the sources in the scene
     */
    GetMaxFrameCount: () => number;
    /**
     * @returns Sets the time in the scene
     */
    SetSceneTime: (Date) => void;

    /**
     * Listener function to register when time changes within the scene from a different source.
     * When the callback is executed, this component will update to the new time.
     * @param fn
     */
    OnSceneTimeUpdated: (fn: (d: Date) => void) => void;
};

type AnimationControlState = {
    /** Frames per second */
    speed: number;
    /** Current play status */
    playing: boolean;
    /** The current frame index for the slider */
    current_frame: number;
};

/**
 * Animation controls allows for visualizing the 3js scene in time.
 * AnimationControls provides functions for updating the scene
 * in time.
 */
class AnimationControls extends React.Component<
    AnimationControlProps,
    AnimationControlState
> {
    private _start_time: Date;
    private _end_time: Date;
    private _current_time: Date;
    private _cadence: number;
    private _frame_delay: number;
    private _interval: number;

    constructor(props: AnimationControlProps) {
        super(props);
        this.state = {
            speed: 15,
            playing: false,
            current_frame: 0,
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

        /**
         * Register listener to update state slider when scene time changes.
         */
        this.props.OnSceneTimeUpdated((date: Date) => {
            try {
                this.SetFrameForDate(date);
            } catch (err) {
                // Being called with no models is expected, and not an issue.
                // Other errors should be raised.
                if (err !== "No models in the scene") {
                    throw err;
                }
            }
        });
    }

    /**
     * Sets the start/end animation times and the current time.
     */
    _InitializeAnimationRangeFromInputs() {
        let sceneTime = this.props.GetSceneTime();
        let range = this.props.GetSceneTimeRange();
        if (sceneTime < range[0] || sceneTime > range[1]) {
            this._current_time = range[0];
        } else {
            this._current_time = sceneTime;
        }
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
        this._frame_delay = 1000 / fps;

        // Cadence is determined via the total number of frames available.
        // First, ask the scene for the frame count, then divide the time range
        // by that count to get the amount that time should move forward each frame.
        let frame_count = this.props.GetMaxFrameCount();
        let time_range_seconds =
            (this._end_time.getTime() - this._start_time.getTime()) / 1000;
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
        if (this._interval == 0 && this.state.speed != 0) {
            let animator = this;
            this._interval = window.setInterval(() => {
                animator._TickFrame();
            }, this._frame_delay);
            this.setState({ playing: true });
        }
    }

    /**
     * Stops the animation
     */
    Pause() {
        clearInterval(this._interval);
        this._interval = 0;
        this.setState({ playing: false });
    }

    /**
     * Toggles Play/Pause
     */
    Toggle() {
        if (this.IsPlaying()) {
            this.Pause();
        } else {
            this.Play();
        }
    }

    IsPlaying(): boolean {
        return this.state.playing;
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
        this.setState({ current_frame: this.state.current_frame + 1 }, () => {
            this._current_time = this._GetNextFrameTime();
            this._UpdateScene();
        });
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
            this.setState({ current_frame: 0 });
            return new Date(this._start_time);
        } else {
            // Otherwise, return this as the next date
            return nextTime;
        }
    }

    UpdateSpeed(newVal: string) {
        let tentativeValue = parseFloat(newVal);
        if (!isNaN(tentativeValue)) {
            this.setState({ speed: tentativeValue }, () => {
                // If animation is ongoing, then pause/play to update animation to the new speed
                if (this.IsPlaying()) {
                    this.Pause();
                    this.Play();
                }
            });
        } else {
            this.setState({ speed: 0 }, () => {
                if (this.IsPlaying()) {
                    this.Pause();
                }
            });
        }
    }

    /**
     * Updates the scene to a specific frame.
     * This is determined by calculating the date based on the frame number
     * @param frame
     */
    SetSpecificFrame(frame: number) {
        this._InitializeAnimationRangeFromInputs();
        // _cadence represents the seconds between each frame.
        // Multiply this by the frame number to get the amount of time from the beginning of the animation range.
        let secondsFromStart = this._cadence * frame;
        let newTime = new Date(this._start_time);
        // Compute a date with the desired time
        newTime.setSeconds(newTime.getSeconds() + secondsFromStart);
        // Set this to the current time
        this._current_time = newTime;
        // Tell the scene to use the new time
        this._UpdateScene();
        this.setState({ current_frame: frame });
    }

    /**
     * Updates the current frame index to be as close as possible to the given date.
     * @param date
     */
    SetFrameForDate(date: Date) {
        // Get the full time range for scene
        let range = this.props.GetSceneTimeRange();
        // Determine the length of that time span
        let timespan = range[1].getTime() - range[0].getTime();
        // Determine how far into that timespan the given date would be. as a percentage
        let givenOffset = date.getTime() - range[0].getTime();
        let percentOffset = givenOffset / timespan;

        // Using the percentage, calculate the frame index.
        let nFrames = this.props.GetMaxFrameCount();
        let targetFrame = Math.round(percentOffset * nFrames);
        // Clamp the value between 0 and nFrames
        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        targetFrame = clamp(targetFrame, 0, nFrames);
        this.setState({ current_frame: targetFrame });
    }

    render() {
        return (
            <div
                tabIndex={-1}
                aria-hidden={this.props.visible ? "false" : "true"}
                className={css.player}
            >
                {/* <CloseButton onClose={this.props.onClose} /> */}
                <Input
                    style={{
                        marginBottom: 0,
                        maxWidth: "200px",
                        marginRight: "15px",
                    }}
                    className={css.controls_input}
                    labelClass={css.fps_label}
                    label="FPS"
                    type="number"
                    value={this.state.speed.toString()}
                    onChange={(val) => this.UpdateSpeed(val)}
                />

                <div className={css.controls}>
                    <MoviePlayerFacade
                        className={css.progress}
                        frameCount={this.props.GetMaxFrameCount()}
                        SetFrame={(n) => this.SetSpecificFrame(n)}
                        currentFrame={this.state.current_frame}
                    />

                    <button
                        className={css.play_pause_button}
                        onClick={() => this.Toggle()}
                        id="js-play-btn"
                    >
                        <span className="material-symbols-outlined">
                            {this.IsPlaying() ? "pause" : "play_arrow"}
                        </span>
                    </button>
                </div>
            </div>
        );
    }
}

export default AnimationControls;
