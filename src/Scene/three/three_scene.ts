import { Scene, OrthographicCamera, WebGLRenderer, AxesHelper, Mesh, Vector3, Raycaster, Vector2 } from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import {Tween, Easing, update as TweenUpdate} from "@tweenjs/tween.js";
import Config from "../../Configuration.js";
import HTML from '../../common/html.js';
import Coordinates from "../../common/coordinates.js";
import { FocalPointMaintainer } from "./focal_point_maintainer";

let enable_debug = true;

/**
 * This class represents the interface for Helios to interact with ThreeJS.
 * This allows us to encapsulate threejs specific logic away from the rest of the app.
 */
class ThreeScene {
    /** Internal threejs scene. */
    private _scene: Scene;
    /** Camera that controls what is displayed in the viewport */
    private _camera: OrthographicCamera;
    /** Handle to the underlying renderer */
    private _renderer: WebGLRenderer;
    /** Implementation for panning, zooming, rotating, etc. */
    private _controls: TrackballControls;
    private _focal_point_maintainer: FocalPointMaintainer;

    /**
     * Initializes the scene into the given element
     *
     * @param {string} viewport_id HTML ID of the element to use for the viewport
     */
    constructor(viewport_id) {
        // Initialize the threejs scene
        this._scene = new Scene();

        // Create the camera and set its default position
        this._camera = new OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0, 1000);
        this._camera.position.x = 0;
        this._camera.position.y = 0;
        this._camera.position.z = -100;
        this._camera.zoom = 160;
        this._camera.updateProjectionMatrix();

        // Initialize the renderer
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        // Set the renderer to render to the main viewport
        let target = HTML.viewport;
        target.appendChild(this._renderer.domElement);

        // Initialize input controls via TrackballControls
        this._controls = new TrackballControls(this._camera, this._renderer.domElement);
        this._controls.panSpeed = Config.camera_pan_speed;
        this._controls.enabled = true;
        this._controls.rotateSpeed = 2.3;
        this._controls.update();

        // Create the focal point maintainer to manage the focus for zooming/panning/rotating
        this._focal_point_maintainer = new FocalPointMaintainer(this._scene, this._camera, this._controls);
        this._controls.addEventListener("start", () => this._focal_point_maintainer.OnInteractionStart());
        this._controls.addEventListener("end", () => this._focal_point_maintainer.OnInteractionEnd());

        // Allow the page to be resized
        this._EnableResizing();

        // Enable debug features if the flag is set
        if (enable_debug) {
            this._EnableDebug();
        }

        // Begin the main update loop
        let scene_info = this;
        function animate(time) {
            requestAnimationFrame(animate);
            TweenUpdate(time);

            scene_info._controls.update();
            scene_info._renderer.render(scene_info._scene, scene_info._camera);
            if (enable_debug) {
                if (scene_info._camera) {
                    let camera_position = document.getElementById("js-camera-position");
                    if (camera_position) {
                        let pos = scene_info._camera.position;
                        camera_position.textContent = "(" + pos.x + ", " + pos.y + ", " + pos.z + "). Zoom: " + scene_info._camera.zoom;
                    }
                }
            }
        }
        animate(0);
    }

    /**
     * Sets an event listener on the window to handle resize events
     * @private
     */
    _EnableResizing() {
        let camera = this._camera;
        let renderer = this._renderer;
        function onWindowResize(){
            camera.left = window.innerWidth / -2;
            camera.right = window.innerWidth / 2;
            camera.top = window.innerHeight / 2;
            camera.bottom = window.innerHeight / -2;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }
        window.addEventListener('resize', onWindowResize);
    }

    /**
     * Adds a model to the scene
     * @param {Mesh} 3js mesh to add to the scene
     */
    AddModel(model: Mesh) {
        this._scene.add(model);
    }

    /**
     * Moves the camera to the given position
     * @param {Coordinates} position
     * @param {boolean} skip_tween Determines if smoothing should be skipped or not.
     */
    MoveCamera(position: Coordinates, skip_tween: boolean) {
        let camera = this._camera;
        if (skip_tween) {
            camera.position.copy(position.toVector3());
            camera.up = new Vector3(0, 1, 0);
        } else {
            const tween = new Tween(this._camera.position)
                .to(position, Config.camera_tween_time)
                .easing(Easing.Cubic.InOut)
                .onUpdate(() => {
                    camera.lookAt(new Vector3(0, 0, 0));
                })
                .start();
            const up_tween = new Tween(this._camera.up)
                .to(new Vector3(0, 1, 0), Config.camera_tween_time)
                .easing(Easing.Cubic.InOut)
                .start();
        }
    }

    /**
     * Points the camera to the given position
     * @param {Vector3}
     */
    PointCamera(position: Vector3) {
        this._camera.lookAt(position);
    }

    /**
     * Removes the given model from the scene
     * @param {Mesh} model to remove
     */
    RemoveModel(model: Mesh) {
        this._scene.remove(model);
    }

    GetTextureInitFunction() {
        return this._renderer.initTexture;
    }

    _EnableDebug() {
        const axesHelper = new AxesHelper(5);
        this._scene.add(axesHelper);
    }
}

export {ThreeScene};
