import Coordinates from "../common/coordinates";

/**
 * Converts an object with x, y, z values to our Coordinate object
 * @returns Coordinates
 */
function ToCoordinates(response: Object): Coordinates {
    let x = response["x"];
    let y = response["z"];
    let z = response["y"];
    return new Coordinates(-x, y, z);
}

export { ToCoordinates };
