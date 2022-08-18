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
        this.helioviewer_url = "https://api.helioviewer.org/v2/";

        /**
         * Geometry service URL used to query position information
         */
        this.geometry_service_url = "http://swhv.oma.be/position";

        /**
         * HTML ID of the start time picker for the date range chooser
         */
        this.date_range_start_id = "js-date-range-start";

        /**
         * HTML ID of the end time picker for the date range chooser
         */
        this.date_range_end_id = "js-date-range-end";

        /**
         * HTML ID of the cadence input date range chooser
         */
        this.date_range_cadence_id = "js-date-range-cadence";

        /**
         * HTML ID of the source id input selector
         */
        this.source_selector_id = "js-source-selector";

        /**
         * HTML ID of the resolution input selector
         */
        this.resolution_selector_id = "js-resolution-selector";

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

