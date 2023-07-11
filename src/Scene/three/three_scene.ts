import {
    Scene,
    OrthographicCamera,
    WebGLRenderer,
    AxesHelper,
    Mesh,
    Vector3,
} from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { update as TweenUpdate } from "@tweenjs/tween.js";
import Config from "../../Configuration.js";
import HTML from "../../common/html.js";
import Coordinates from "../../common/coordinates.js";
import { FocalPointMaintainer } from "./focal_point_maintainer";
import { HeliosCamera } from "./HeliosCamera";

let enable_debug = true;

/**
 * This class represents the interface for Helios to interact with ThreeJS.
 * This allows us to encapsulate threejs specific logic away from the rest of the app.
 */
class ThreeScene {
    /** Internal threejs scene. */
    private _scene: Scene;
    /** Camera that controls what is displayed in the viewport */
    private _camera: HeliosCamera;
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
        this._camera = new HeliosCamera(new OrthographicCamera(
            window.innerWidth / -2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            window.innerHeight / -2,
            0,
            1000
        ));
        this._camera.Move(new Vector3(0, 0, -100), new Vector3(0, 0, 0));
        this._camera.SetZoom(160);

        // Initialize the renderer
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        // Set the renderer to render to the main viewport
        let target = HTML.viewport;
        target.appendChild(this._renderer.domElement);

        // Initialize input controls via TrackballControls
        this._controls = new TrackballControls(
            this._camera.GetCameraInstance(),
            this._renderer.domElement
        );
        this._controls.panSpeed = Config.camera_pan_speed;
        this._controls.enabled = true;
        this._controls.rotateSpeed = 2.3;
        this._controls.update();

        // Create the focal point maintainer to manage the focus for zooming/panning/rotating
        this._focal_point_maintainer = new FocalPointMaintainer(
            this._scene,
            this._camera.GetCameraInstance(),
            this._controls
        );
        this._controls.addEventListener("start", () =>
            this._focal_point_maintainer.OnInteractionStart()
        );
        this._controls.addEventListener("end", () =>
            this._focal_point_maintainer.OnInteractionEnd()
        );

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
            scene_info._renderer.render(scene_info._scene, scene_info._camera.GetCameraInstance());
            if (enable_debug) {
                if (scene_info._camera) {
                    let camera_position =
                        document.getElementById("js-camera-position");
                    if (camera_position) {
                        let pos = scene_info._camera.GetPosition();
                        camera_position.textContent =
                            "(" +
                            pos.x +
                            ", " +
                            pos.y +
                            ", " +
                            pos.z +
                            "). Zoom: " +
                            scene_info._camera.GetZoom();
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
        function onWindowResize() {
            camera.OnWindowResize();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener("resize", onWindowResize);
    }

    /**
     * Adds a model to the scene
     * @param {Mesh} 3js mesh to add to the scene
     */
    AddModel(model: Mesh) {
        this._scene.add(model);
    }

    GetCamera(): HeliosCamera {
        return this._camera;
    }

    GetCameraTarget() {
        return this._focal_point_maintainer.target;
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

export { ThreeScene };
