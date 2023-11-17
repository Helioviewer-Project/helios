import { Camera, Quaternion, Scene, Vector3, Vector2, Raycaster } from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

type CameraState = {
    position: Vector3;
    quaternion: Quaternion;
};

/**
 * This class maintains the camera focal point so that user interaction feels smooth and intuitive.
 *
 * By default with trackball controls, when the user pans and zooms, the focal point remains on the object's center.
 * Because of this, the user can't rotate around a specific point they're looking at.
 * The FocalPointMaintainer watches for these interactions and updates the focal point to the new focus when it makes sense to do so.
 */
class FocalPointMaintainer {
    /** Current scene, needed to access children for raycasting */
    private _scene: Scene;
    /** Current camera, needed to detect rotate/pan/zoom operations */
    private _camera: Camera;
    /** Controls used to set new focal point */
    private _controls: TrackballControls;
    /** Vector representing the center of the screen in normalized coordinates (-1 to 1) */
    private _center_screen = new Vector2(0, 0);
    /** Raycaster for determining which mesh is in the center of the screen */
    private _raycaster = new Raycaster();
    public target: Vector3;

    constructor(scene: Scene, camera: Camera, controls: TrackballControls) {
        this._scene = scene;
        this._camera = camera;
        this._controls = controls;
        this.target = new Vector3(0, 0, 0);
    }

    /** Represents the state of the camera when interaction started */
    private _last_camera_state: CameraState;

    /**
     * Execute when interaction begins.
     * @param {Camera} camera The scene camera
     */
    public OnInteractionStart() {
        this._last_camera_state = this._GetCameraState(this._camera);
    }

    public OnInteractionEnd() {
        let camera_state = this._GetCameraState(this._camera);
        if (this._UserPanned(this._last_camera_state, camera_state)) {
            this._UpdateFocalPoint();
        }
    }

    /**
     * Returns the CameraState for the given camera
     * @param camera Camera to extract the state from
     */
    private _GetCameraState(camera: Camera): CameraState {
        return {
            position: camera.position.clone(),
            quaternion: camera.quaternion.clone(),
        };
    }

    /**
     * Compares 2 camera states and determines if a "pan" operation was performed
     */
    private _UserPanned(a: CameraState, b: CameraState): Boolean {
        return a.quaternion.equals(b.quaternion);
    }

    /**
     * Updates the focal
     * @param controls
     */
    private _UpdateFocalPoint() {
        this._raycaster.setFromCamera(this._center_screen, this._camera);
        const intersects = this._raycaster.intersectObjects(
            this._scene.children
        );
        for (let i = 0; i < intersects.length; i++) {
            let intersection = intersects[i];
            if (intersection.object.type == "Mesh") {
                this._controls.target = intersection.point;
                this.target.copy(intersection.point);
                break;
            }
        }
    }
}

export { FocalPointMaintainer };
