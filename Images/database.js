import ImageFinder from './image_finder.js';
import PositionFinder from './position_finder.js';
import Coordinates from '../common/coordinates.js';

/**
 * Interface for querying image and positional information
 */
class Database {
    /**
     * @typedef {Object} HeliosImage
     * @property {Date} date Timestamp for this image
     * @property {string} url URL of the image
     * @property {Coordinates} observer_position Position of the observer in scene coordinates
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
    GetImages(source, start, end, cadence, scale) {
        return [
            {date: new Date("2022-08-13 00:00:22"), url: "http://localhost:8081/v2/downloadImage/?id=117&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 01:00:22"), url: "http://localhost:8081/v2/downloadImage/?id=121&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 02:00:22"), url: "http://localhost:8081/v2/downloadImage/?id=125&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 03:00:22"), url: "http://localhost:8081/v2/downloadImage/?id=129&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 04:00:34"), url: "http://localhost:8081/v2/downloadImage/?id=130&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 05:00:22"), url: "http://localhost:8081/v2/downloadImage/?id=158&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 06:00:34"), url: "http://localhost:8081/v2/downloadImage/?id=113&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 08:00:22"), url: "http://localhost:8081/v2/downloadImage/?id=152&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 09:00:10"), url: "http://localhost:8081/v2/downloadImage/?id=144&scale=8", observer_position: new Coordinates(1, 1, 1)}
        ];
    }
}

let db = new Database();
export default db;

