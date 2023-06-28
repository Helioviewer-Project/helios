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
        // convert time to a string
        let date_str = time.toISOString();
        // Construct URL
        let api_url = this.api_url + "?utc=" + date_str + "&observer=" + observer + "&target=SUN&ref=HEEQ";
        try {
            // Perform Get Request
            var result = await fetch(api_url);
        } catch (e) {
            throw "Could not load position data";
        }

        // Extract the data from the results
        // Result has a wonky format of { result: [ {ISO String w/o Z}: [x, y, z] ]
        if (result.ok) {
            let json = await result.json();
            let key = date_str.substr(0, 23);
            let data = json.result[0][key];
            // Translate results into coordinates
            return new Coordinates(data[0], data[1], data[2]);
        } else {
            console.error(result);
            throw "Could not load position data";
        }
    }
}

let SingletonAPI = new GeometryService();
export default SingletonAPI;

