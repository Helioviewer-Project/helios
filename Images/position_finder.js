import Helioviewer from '../API/helioviewer.js';
import Coordinates from '../common/coordinates.js'

/**
 * API used for getting positional information for objects
 * within the scene.
 */
class PositionFinder {
    /**
     * Gets coordinates for the given observer at the specified time
     *
     * @param {number} id ID of the jp2 image to get information about
     * @returns {Coordinates} Scene coordinates
     */
    async GetPosition(id) {
        let coordinates = await Helioviewer.GetJp2Observer(id);
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

