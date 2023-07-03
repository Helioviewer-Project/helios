import { Vector3 } from "three";

/**
 * Represents coordinates in 3D space
 */
class Coordinates {
    /**
     * Creates a coordinates instance
     *
     * @param {number} x X position
     * @param {number} y Y position
     * @param {number} z Z position
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    toVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
}

export default Coordinates;
