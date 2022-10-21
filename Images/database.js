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
     * @property {JP2info} jp2info Metadata about this image
o     */
    /**
     * Query data sources for a list of image information
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @return {Arrray<Promise<HeliosImage>>}
     */
    GetImages(source, start, end, cadence, scale) {
        // Initialize array of objects that will be returned
        try {
            // Query the images for the given time range
            let image_promises = ImageFinder.GetImages(source, start, end, cadence, scale);
            let result_promises = [];
            // For each image, get their observer's position in space
            for (const promise of image_promises) {
                // By storing the promise for now, we can blast out all the requests at once
                // Hopefully this doesn't get us rate limited...
                result_promises.push(promise.then((image) => {
                    if (image) {
                        let observer_position_promise = PositionFinder.GetPosition(image.id);
                        let helios_image = {
                            date: image.timestamp,
                            url: image.url,
                            jp2info: image.jp2info,
                            position: observer_position_promise
                        };
                        return helios_image;
                    } else {
                        return false;
                    }
                }));
            }

            return result_promises;
        } catch (e) {
            throw 'Failed to load images from database';
        }
    }
}

let db = new Database();
export default db;

