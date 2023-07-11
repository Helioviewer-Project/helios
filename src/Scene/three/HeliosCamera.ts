import { Camera, OrthographicCamera, Vector3 } from "three";
import { Tween, Easing } from "@tweenjs/tween.js";
import Config from "../../Configuration";

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
    constructor(camera: ThreeCamera) {
        this._camera = camera;
        this._saved_state = null;
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
    }

    /**
     * Restores the last saved camera position/target
     */
    LoadState() {
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
}

export { HeliosCamera }