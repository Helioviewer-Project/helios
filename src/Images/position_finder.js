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
     * Converts coordinates returned from the position API into scene coordinates
     */
    _ToSceneCoordinates(coordinates) {
        // This function used to be used to scale down large values into small values within
        // rendering range. However, the API is now expected to return coordinates in X,Y,Z R_SUN units.
        // If coordinates are ever returned in a non-standard format, this function may be used to
        // transform them into usable values for rendering.
        return coordinates;
    }
}

let finder = new PositionFinder();

export default finder;

