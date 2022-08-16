import GeometryService from '../API/geometry_service.js';
import Coordinates from '../common/coordinates.js'

/**
 * API used for getting positional information for objects
 * within the scene.
 */
class PositionFinder {
    /**
     * Gets coordinates for the given observer at the specified time
     *
     * @param {Date} time Point in time to query
     * @param {string} observer The object to get the position of
     * @returns {Coordinates} Scene coordinates
     */
    GetPosition(time, observer) {
        let coordinates = GeometryService.GetPosition(time, observer);
        return this._ToSceneCoordinates(coordinates);
    }

    /**
     * Converts HEEQ coordinates into scene coordinates
     */
    _ToSceneCoordinates(coordinates) {
        // TODO: Convert coordinates into scene coordinates
        return new Coordinates(100, 100, 100);
    }
}

let finder = new PositionFinder();

export default finder;

