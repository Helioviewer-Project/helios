import { Camera, OrthographicCamera, Scene, Vector3 } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import Config from "../../Configuration";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { FocalPointMaintainer } from "./focal_point_maintainer";

type ThreeCamera = OrthographicCamera;
type SavedCamerastate = {
    position: Vector3;
    target: Vector3;
    zoom: number;
}

/**
 * Interface for working with the threejs camera
 */
class HeliosCamera {

    private _camera: ThreeCamera;
    private _saved_state: SavedCamerastate;
    private _scene: Scene;
    private _controls: TrackballControls;
    private _canvas: HTMLCanvasElement;
    private _focal_point_maintainer: FocalPointMaintainer;

    constructor(camera: ThreeCamera, scene: Scene, canvas: HTMLCanvasElement) {
        console.log(this);
        this._camera = camera;
        this._saved_state = null;
        this._canvas = canvas;
        this._scene = scene;

        // Initialize input controls via TrackballControls
        this._controls = new TrackballControls(
            this._camera,
            this._canvas
        );
        this._controls.panSpeed = Config.camera_pan_speed;
        this._controls.enabled = true;
        this._controls.rotateSpeed = 2.3;
        this._controls.update();

        // Create the focal point maintainer to manage the focus for zooming/panning/rotating
        this._focal_point_maintainer = new FocalPointMaintainer(
            this._scene,
            this._camera,
            this._controls
        );
        this._controls.addEventListener("start", () =>
            this._focal_point_maintainer.OnInteractionStart()
        );
        this._controls.addEventListener("end", () =>
            this._focal_point_maintainer.OnInteractionEnd()
        );
    }

    GetCameraInstance(): Camera {
        return this._camera;
    }

    SetZoom(zoom: number) {
        this._camera.zoom = zoom;
        this._camera.updateProjectionMatrix();
    }

    GetZoom(): number {
        return this._camera.zoom;
    }

    ResetUpVector() {
        this._camera.up = new Vector3(0, 1, 0);
    }

    OnWindowResize() {
        this._camera.left = window.innerWidth / -2;
        this._camera.right = window.innerWidth / 2;
        this._camera.top = window.innerHeight / 2;
        this._camera.bottom = window.innerHeight / -2;
        this._camera.updateProjectionMatrix();
    }

    /**
     * Moves the camera to the given position in a smooth animation while pointing towards the given target
     */
    Move(position: Vector3, target: Vector3, onMoveDone: () => void = () => {}) {
        new Tween(this._camera.position)
            .to(position, Config.camera_tween_time)
            .easing(Easing.Cubic.InOut)
            .onUpdate(() => {
                this._camera.lookAt(target);
            })
            .onComplete(onMoveDone)
            .start();
        new Tween(this._camera.up)
            .to(new Vector3(0, 1, 0), Config.camera_tween_time)
            .easing(Easing.Cubic.InOut)
            .start();
    }

    /**
     * Moves the camera to the given location without any animation.
     * @param position
     * @param target
     */
    Jump(position: Vector3, target: Vector3) {
        this._camera.position.copy(position);
        this._camera.lookAt(target);
    }

    GetPosition(): Vector3 {
        return this._camera.position.clone();
    }

    /**
     * Points the camera towards the given position
     * @param position
     */
    Target(position: Vector3) {
        this._camera.lookAt(position);
    }

    /**
     * Saves the current camera position/target
     */
    SaveState(target: Vector3) {
        this._saved_state = {
            position: this._camera.position.clone(),
            target: target.clone(),
            zoom: this._camera.zoom
        }
        console.log(this._saved_state);
    }

    /**
     * Restores the last saved camera position/target
     */
    LoadState() {
        console.log("Current position: ", this._camera.position);
        console.log("Target position: ", this._saved_state.position);
        if (this._saved_state) {
            this.Move(
                this._saved_state.position,
                this._saved_state.target
            );
            new Tween(this._camera)
                .to({zoom: this._saved_state.zoom}, Config.camera_tween_time)
                .easing(Easing.Cubic.InOut)
                .onUpdate(() => {
                    this._camera.updateProjectionMatrix()
                })
                .start();
        }
    }

    update() {
        this._controls.update();
    }
}

export { HeliosCamera }