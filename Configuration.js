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
    constructor(overrides) {
        this.InitializeDefaults();
        this._ApplyOverrides(overrides);
    }

    /**
     * Default configuration initialization. All default values
     * should be specified and documented here.
     */
    InitializeDefaults() {
        // Helioviewer base API Url. Requires trailing /
        this.helioviewer_url = "https://api.helioviewer.org/v2/";

        // Geometry service URL used to query position information
        // Requires trailing /
        this.geometry_service_url = "http://swhv.oma.be/position";
    }

    /**
     * Overrides any default values with data specfied in the given object
     *
     * @param[in] overrides Object containing specific configuration values
     *                      to override
     */
    _ApplyOverrides(overrides) {
        for (const key of Object.keys(overrides)) {
            this[key] = overrides[key];
        }
    }
}

// Using this syntax for export to support jsdoc
export default Config;
