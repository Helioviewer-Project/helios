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
        this.InitializeDefaults();
    }

    /**
     * Default configuration initialization. All default values
     * should be specified and documented here.
     */
    InitializeDefaults() {
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
    }

    /**
     * Overrides any member values with data specfied in the given object
     * For example, to override helioviewer_url, pass in an object with
     * {helioviewer_url: "your url"}
     *
     * @param[in] overrides Object containing specific configuration values
     *                      to override
     */
    UpdateConfiguration(overrides) {
        for (const key of Object.keys(overrides)) {
            this[key] = overrides[key];
        }
    }
}

let config = new Config();
export default config;

