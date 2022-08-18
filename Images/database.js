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
            {date: new Date("2022-08-13 10:05:22"), url: "http://localhost:8081/v2/downloadImage/?id=87&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:05:58"), url: "http://localhost:8081/v2/downloadImage/?id=86&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:06:34"), url: "http://localhost:8081/v2/downloadImage/?id=85&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:07:10"), url: "http://localhost:8081/v2/downloadImage/?id=84&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:07:46"), url: "http://localhost:8081/v2/downloadImage/?id=83&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:08:10"), url: "http://localhost:8081/v2/downloadImage/?id=82&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:08:22"), url: "http://localhost:8081/v2/downloadImage/?id=81&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:08:46"), url: "http://localhost:8081/v2/downloadImage/?id=80&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:09:22"), url: "http://localhost:8081/v2/downloadImage/?id=79&scale=8", observer_position: new Coordinates(1, 1, 1)},
            {date: new Date("2022-08-13 10:09:58"), url: "http://localhost:8081/v2/downloadImage/?id=78&scale=8", observer_position: new Coordinates(1, 1, 1)}
        ];
    }
}

let db = new Database();
export default db;

