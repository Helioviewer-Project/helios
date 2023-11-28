import Coordinates from "../common/coordinates";

/**
 * Converts an object with x, y, z values to our Coordinate object
 * Important mapping of API/Python coordinate system to Web/Threejs system.
 * X : Y
 * Y : Z
 * Z : X
 * Threejs : Python
 * @returns Coordinates
 */
function ToCoordinates(response: Object): Coordinates {
    let x = response["y"];
    let y = response["z"];
    let z = response["x"];
    return new Coordinates(x, y, z);
}

export { ToCoordinates };
