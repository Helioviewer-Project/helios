/**
 * Helios configuration. Stores read only information
 * that controls specific Helios behavior.
 */
class Config {
    /**
     * Builds a configuration overriding default values
     * with whatever is given in the constructor
     *
     * @param[in] overrides Object where each key-value pair is meant
     *                      to override a default setting
     */
    constructor() {
        this._InitializeDefaults();
    }

    /**
     * Default configuration initialization. All default values
     * should be specified and documented here.
     * @private
     */
    _InitializeDefaults() {
        /**
         * Helioviewer base API Url. Requires trailing /
         */
        this.helioviewer_url = "https://api.helioviewer.org/";

        /**
         * Geometry service URL used to query position information
         */
        this.geometry_service_url = "http://swhv.oma.be/position";

        /**
         * HTML ID of the start time picker for the date range chooser
         */
        this.start_picker_id = "js-start-date-picker";

        /**
         * HTML ID of the end time picker for the date range chooser
         */
        this.end_picker_id = "js-end-date-picker";

        /**
         * HTML ID of the frame count input date range chooser
         */
        this.date_range_frames_id = "js-date-range-frames";

        /**
         * HTML ID of the source id input selector
         */
        this.source_selector_id = "js-source-selector";

        /**
         * HTML ID of the resolution input selector
         */
        this.resolution_selector_id = "js-resolution-selector";

        /**
         * HTML ID of the animation fps input
         */
        this.animation_fps_id = 'js-animation-speed';

        /**
         * HTML ID of the animation fps duration
         */
        this.animation_duration_id = 'js-animation-duration';

        /**
         * HTML ID of the play button for animation controls
         */
        this.play_btn_id = 'js-play-btn';

        /**
         * HTML ID of the pause button for animation controls
         */
        this.pause_btn_id = 'js-pause-btn';

        /**
         * HTML ID of the element to use for the 3js viewport
         */
        this.viewport_id = "js-helios-viewport";

        /**
         * HTML ID of the button that triggers adding data to the scene
         */
        this.add_source_btn_id = "js-add-source";

        /**
         * HTML ID of the input element used to change the current time.
         */
        this.scene_time_input = "js-current-scene-time";

        /**
         * HTML class attached to elements that should be hidden
         * when helios is enabled
         */
        this.hidden_class = "helios-hidden";

        /**
         * HTML class attached to elements that should be displayed
         * when helios is enabled
         */
        this.show_class = "helios-visible";

        /**
         * HTML ID for the button that will display/hide the Helios viewport
         * when clicked.
         */
        this.toggle_button_id = "js-enable-helios";

        /**
         * HTML ID for input element for loading Helioviewer movies;
         */
        this.helioviewer_movie_input_id = "js-helioviewer-movie";

        /**
         * HTML ID for the button that loads the helioviewer movies
         */
        this.helioviewer_movie_load_button = "js-helioviewer-movie-load";

        /**
         * HTML ID for the "loader" element that gets animated when there are outstanding ajax requests
         */
        this.loader_id = "loader";

        /**
         * CSS Class to apply to the loader when an ajax request is outstanding
         */
        this.loader_class = "loading";

        /**
         * HTML ID for the element that will contain controls for the current sources in the scene.
         */
        this.ui_sources_id = "current-sources";

        /**
         * Number of milliseconds away from the scene time that causes the model timestamp to turn orange.
         */
        this.time_warn_threshold = 60000;

        /**
         * Number of milliseconds away from the scene time that causes the model timestamp to turn red.
         */
        this.time_off_threshold = 300000;

        /**
         * Limits the maximum images to be queried from helioviewer for a single date range.
         */
        this.max_dates_in_query = 60;

        /**
         * The length of time to use for animation durations with moving the camera around.
         */
        this.camera_tween_time = 1000;

        /**
         * Sources IDs that should be rendered on a plane rather than a hemisphere
         */
        this.plane_sources = [4, 5, 28, 29, 30, 31, 83];

        /**
         * Base image sizes, needed to make sure we query the correct resolution
         * If a source is not specified, then the next source going down is used. For example, 9 through 19 are not listed because they all use the same source as 8.
         */
        this.source_resolutions = {
            0: 1024,  // 0 - 7
            8: 4096,  // 8 - 19
            20: 2048, // 20 - 27
            28: 512,  // 28
            29: 2048, // 29
            30: 512,  // 30
            31: 2048, // 31
            33: 512,  // 33-35
            75: 1024, // 75-76
            77: 512,  // 77
            78: 1024, // 78-83
        };

        /**
         * Naming of sources is slightly different between helioviewer and helios.
         * This mapping can be used to convert between the two.
         * If a name doesn't exist in this map, assume its the same for both.
         */
        this.helioviewer_to_helios_names = {
            STEREO_A: "STEREO-A",
            STEREO_B: "STEREO-B",
            SECCHI: ""
        };
    }

    /**
     * Overrides any member values with data specfied in the given object
     * For example, to override helioviewer_url, pass in an object with
     * {helioviewer_url: "your url"}
     *
     * @note Currently only functional for API urls
     *
     * @param[in] overrides Object containing specific configuration values
     *                      to override
     */
    Update(overrides) {
        for (const key of Object.keys(overrides)) {
            this[key] = overrides[key];
        }
    }
}

let config = new Config();
export default config;

