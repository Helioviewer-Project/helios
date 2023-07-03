import Scene from "../Scene/scene.js";

/**
 * Camera controls provide UI functions for locking the
 * camera to specific positions
 */
class CameraControls {
    /**
     * Locks the camera to a specific source's observer
     *
     * @param {number} id Scene model ID to lock camera on to
     */
    LockTo(id) {
        Scene.LockCamera(id);
    }

    /**
     * Unlocks the camera from its locked position
     */
    Unlock() {
        Scene.UnlockCamera();
    }
}

let controls = new CameraControls();
export default controls;
