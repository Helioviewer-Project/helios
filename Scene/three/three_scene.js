import { Scene, OrthographicCamera, WebGLRenderer, AxesHelper, BoxGeometry, MeshBasicMaterial, Mesh, Vector3 } from "three";

import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";

import {Tween, Easing, update as TweenUpdate} from "@tweenjs/tween.js";

import Config from "../../Configuration.js";

let enable_debug = true;

/**
 * Wrapper for the 3js scene to keep Helios scene logic
 * separate from 3js scene logic
 */
class ThreeScene {
    /**
     * Initializes the scene into the given element
     *
     * @param {string} viewport_id HTML ID of the element to use for the viewport
     */
    constructor(viewport_id) {
        /**
         * 3js scene
         * @private
         */
        this._scene = new Scene();

        /**
         * Camera instance
         * @private
         */
        this._camera = new OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0, 1000);
        this._camera.position.x = 0;
        this._camera.position.y = 0;
        this._camera.position.z = -100;
        this._camera.zoom = 49;
        this._camera.updateProjectionMatrix();

        /**
         * Renderer instance
         * @private
         */
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);


        let target = document.getElementById(viewport_id);
        target.appendChild(this._renderer.domElement);

        /**
         * Camera controls plugin for user camera movement
         * @private
         */
        this._controls = new TrackballControls(this._camera, this._renderer.domElement);
        this._controls.panSpeed = Config.camera_pan_speed;
        this._controls.enabled = true;
        this._controls.rotateSpeed = 2.3;
        this._controls.update();

        // Allow the page to be resized
        this._EnableResizing();

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
        animate();

        if (enable_debug) {
            this._EnableDebug();
        }
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
    AddModel(model) {
        this._scene.add(model);
    }

    /**
     * Moves the camera to the given position
     * @param {Coordinates} position
     */
    MoveCamera(position) {
        let camera = this._camera;
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

    /**
     * Points the camera to the given position
     * @param {Vector3}
     */
    PointCamera(position) {
        this._camera.lookAt(position);
    }

    /**
     * Removes the given model from the scene
     * @param {model} model to remove
     */
    RemoveModel(model) {
        this._scene.remove(model);
    }

    _EnableDebug() {
        const axesHelper = new AxesHelper(5);
        this._scene.add(axesHelper);

        /* Uncomment to enable reference cubes
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({color: 0x00FF00});
        // material.depthWrite = false;
        const cube = new Mesh(geometry, material);
        cube.position.x = 10;
        cube.position.z = 3;
        // cube.renderOrder = 1;
        this._scene.add(cube);

        const geometry2 = new BoxGeometry(1, 1, 1);
        const material2 = new MeshBasicMaterial({color: 0x00FF00});
        // material2.depthWrite = false;
        const cube2 = new Mesh(geometry, material);
        cube2.position.z = 6;
        this._scene.add(cube2);

        const geometry3 = new BoxGeometry(1, 1, 1);
        const material3 = new MeshBasicMaterial({color: 0x00FF00});
        // material3.depthWrite = false;
        const cube3 = new Mesh(geometry, material);
        cube3.position.z = -6;
        this._scene.add(cube3);
        */
    }
}

export default ThreeScene;
