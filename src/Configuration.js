import { Sources } from "./common/sources";

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
        this.geometry_service_url = "http://swhv.oma.be/position/";

        /**
         * Helios API server url
         */
        // this.helios_api_url = "https://api.gl.helioviewer.org/";
        this.helios_api_url = "http://localhost/";

        /**
         * HTML ID of the element to use for the 3js viewport
         */
        this.viewport_id = "js-helios-viewport";

        /**
         * HTML ID for the "loader" element that gets animated when there are outstanding ajax requests
         */
        this.loader_id = "loader";

        /**
         * CSS Class to apply to the loader when an ajax request is outstanding
         */
        this.loader_class = "loading";

        /**
         * Number of milliseconds away from the scene time that causes the model timestamp to turn orange.
         */
        this.time_warn_threshold = 60000;

        /**
         * Number of milliseconds away from the scene time that causes the model timestamp to turn red.
         */
        this.time_off_threshold = 300000;

        /**
         * Parameter for searching for events. Events will only be queried each hour between the start and end times.
         */
        this.event_cadence_s = 3600;

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
            0: 1024, // 0 - 7
            8: 4096, // 8 - 19
            20: 2048, // 20 - 27
            28: 512, // 28
            29: 2048, // 29
            30: 512, // 30
            31: 2048, // 31
            33: 512, // 33-35
            75: 1024, // 75-76
            77: 512, // 77
            78: 1024, // 78-83
        };

        /**
         * Source IDs associated with observatories from earth
         */
        this.earth_sources = Object.entries(Sources)
            .filter((entry) => !entry[1].startsWith("STEREO"))
            .map((entry) => parseInt(entry[0]));

        /**
         * Naming of sources is slightly different between helioviewer and helios.
         * This mapping can be used to convert between the two.
         * If a name doesn't exist in this map, assume its the same for both.
         */
        this.helioviewer_to_helios_names = {
            STEREO_A: "STEREO-A",
            STEREO_B: "STEREO-B",
            SECCHI: "",
        };

        this.camera_pan_speed = 2.3;

        /**
         * Flag to enable/disable showing features and events.
         * This is a debug flag, currently disabled since this feature is still not well developed.
         */
        this.enable_features_and_events = false;

        /**
         * Texture load resolution
         */
        this.default_texture_resolution = 512;
    }
}

let config = new Config();
export default config;
