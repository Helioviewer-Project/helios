import {
    Scene,
    OrthographicCamera,
    WebGLRenderer,
    AxesHelper,
    Mesh,
    Vector3,
} from "three";
import { update as TweenUpdate } from "@tweenjs/tween.js";
import HTML from "../../common/html.js";
import { HeliosCamera } from "./HeliosCamera";

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
    /** Local axes helper */
    private _axes_helper: AxesHelper;

    /**
     * Initializes the scene
     */
    constructor() {
        // Initialize the threejs scene
        this._scene = new Scene();

        this._axes_helper = new AxesHelper(5);

        // Initialize the renderer
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        // Set the renderer to render to the main viewport
        let target = HTML.viewport;
        target.appendChild(this._renderer.domElement);

        // Create the camera and set its default position
        this._camera = new HeliosCamera(new OrthographicCamera(
            window.innerWidth / -2,
            window.innerWidth / 2,
            window.innerHeight / 2,
            window.innerHeight / -2,
            0,
            1000
        ), this._scene, this._renderer.domElement);
        this._camera.Move(new Vector3(0, 0, -100), new Vector3(0, 0, 0));
        this._camera.SetZoom(160);

        // Allow the page to be resized
        this._EnableResizing();

        this.ToggleAxesHelper();

        // Begin the main update loop
        let scene_info = this;
        function animate(time) {
            requestAnimationFrame(animate);
            TweenUpdate(time);

            scene_info._camera.update();
            scene_info._renderer.render(scene_info._scene, scene_info._camera.GetCameraInstance());
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
        window.addEventListener("orientationchange", onWindowResize);
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

    /**
     * Returns a base64 encoded jpeg data URI.
     * Since this is intended for a thumbnail, the quality is low.
     */
    CreateThumbnailFromCamera(): Promise<string> {
        this._renderer.render(this._scene, this._camera.GetCameraInstance());
        return new Promise<string>((resolve, reject) => {
            this._renderer.domElement.toBlob(async (blob) => {
                let base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(await blob.arrayBuffer())));
                resolve("data:image/jpeg;base64, " + base64);
                console.log(blob);
            }, "image/jpeg", 0.5);
        })
    }

    /**
     * Captures the current camera view into a high quality png
     * @returns {Promise<string>} Base64 data URI
     */
    CreateScreenshotFromCamera(): Promise<string> {
        this._renderer.render(this._scene, this._camera.GetCameraInstance());
        return new Promise<string>((resolve, reject) => {
            this._renderer.domElement.toBlob(async (blob) => {
                let base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(await blob.arrayBuffer())));
                resolve("data:image/png;base64, " + base64);
            }, "image/png", 1);
        })
    }

    async TakeScreenshot() {
        var a = document.createElement('a');
        let url = await this.CreateScreenshotFromCamera();
        a.href = url;
        a.download = 'helios.png';
        a.click();
    }

    /**
     * Toggles the axes helper
     * @returns {boolean} True if the axes helper is visible, False if not.
     */
    ToggleAxesHelper(): boolean {
        if (this._scene.children.find((e) => e == this._axes_helper)) {
            this._scene.remove(this._axes_helper);
            return false;
        } else {
            this._scene.add(this._axes_helper);
            return true;
        }
    }
}

export { ThreeScene };
