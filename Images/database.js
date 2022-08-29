import ImageFinder from './image_finder.js';
import PositionFinder from './position_finder.js';
import Coordinates from '../common/coordinates.js';
import {GetObserverFromSource} from '../common/observers.js';

/**
 * Interface for querying image and positional information
 */
class Database {
    /**
     * @typedef {Object} HeliosImage
     * @property {Date} date Timestamp for this image
     * @property {string} url URL of the image
     * @property {Coordinates} position Position of the observer in scene coordinates
     */
    /**
     * Query data sources for a list of image information
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @return {HeliosImage[]}
     */
    async GetImages(source, start, end, cadence, scale) {
        // Initialize array of objects that will be returned
        let results = [];

        // Query the images for the given time range
        let images = await ImageFinder.GetImages(source, start, end, cadence, scale);

        // For each image, get their observer's position in space
        for (const image of images) {
            // By storing the promise for now, we can blast out all the requests at once
            // Hopefully this doesn't get us rate limited...
            let observer_position_promise = PositionFinder.GetPosition(image.timestamp, GetObserverFromSource(source));
            let helios_image = {
                date: image.timestamp,
                url: image.url,
                position: observer_position_promise
            };
            results.push(helios_image);
        }

        // Now wait for the results of the queries
        for (const image of results) {
            image.position = await image.position;
        }

        return results;
    }
}

let db = new Database();
export default db;

