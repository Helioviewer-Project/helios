import Config from './Configuration.js';
import Helioviewer from './API/helioviewer.js';


/**
 * Helios is the sun god.
 * Usually he can be seen riding his chariot from east
 * to west during the day, but here he is responsible for bootstrapping
 * the application
 *
 * This class is the glue between Helioviewer.org and the Helios
 * application. It manages passing along the helioviewer application's
 * configuraiton and creating instances of all the necessary
 * classes that make up the application.
 */
class Helios {
    /**
     * Initializes Helios with the given configuration
     *
     * @param[in] configuration Helioviewer Config
     */
    constructor(configuration) {
        // Initialize the configuration using settings from Helioviewer
        this.configuration = new Config({
            helioviewer_url: configuration.backEnd,
        });

        // Initialize the API module
        Helioviewer.SetApiUrl(this.configuration.helioviewer_url);
    }
}

// Using this syntax for export to support jsdoc
export default Helios;
