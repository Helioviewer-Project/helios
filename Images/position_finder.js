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
    async GetPosition(time, observer) {
        let coordinates = await GeometryService.GetPosition(time, observer);
        return this._ToSceneCoordinates(coordinates);
    }

    /**
     * Converts HEEQ coordinates into scene coordinates
     */
    _ToSceneCoordinates(coordinates) {
        // Subject to change, but for now use a factor of 10^6.
        // Chosen because Daniel's gut says it feels right.
        let divider = Math.pow(10, 6);
        return new Coordinates(
            coordinates.x / divider,
            coordinates.y / divider,
            coordinates.z / divider
        );
    }
}

let finder = new PositionFinder();

export default finder;

