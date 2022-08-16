import Coordinates from '../common/coordinates.js';

/**
 * Interface for interacting with the Geometry Service used for
 * getting positions of objects in space.
 */
class GeometryService {
    constructor() {
        this.api_url = "http://swhv.oma.be/position"
    }

    /**
     * Sets the API endpoint to use for the geometry service
     *
     * @param {string} url The new API endpoint i.e. http://swhv.oma.be/position
     */
    SetApiUrl(url) {
        this.api_url = url;
    }

    /**
     * Queries the Geometry Service for an observer's position
     *
     * @param {Date} time The time to query
     * @param {string} observer Observer to get the position for
     * @returns Coordinates
     */
    async GetPosition(time, observer) {
        // TODO
        // convert time to a string
        // Construct URL
        // Perform Get Request
        // Translate results into coordinates
        // return
        return new Coordinates(0, 0, 0);
    }
}

let SingletonAPI = new GeometryService();
export default SingletonAPI;

