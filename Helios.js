import Config from './Configuration.js';
import Helioviewer from './API/helioviewer.js';
import GeometryService from './API/geometry_service.js';


/**
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
        this.configuration = Config.Update({
            helioviewer_url: configuration.backEnd,
        });
    }
}

// Using this syntax for export to support jsdoc
export default Helios;
