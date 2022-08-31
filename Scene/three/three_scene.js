import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AxesHelper,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
        this._camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this._camera.position.x = 0;
        this._camera.position.y = 0;
        this._camera.position.z = -10;

        /**
         * Renderer instance
         * @private
         */
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        /**
         * Camera controls plugin for user camera movement
         * @private
         */
        this._orbit_controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._orbit_controls.update();

        let target = document.getElementById(viewport_id);
        target.appendChild(this._renderer.domElement);

        let scene_info = this;
        function animate() {
            requestAnimationFrame(animate);
            scene_info._renderer.render(scene_info._scene, scene_info._camera);
            if (scene_info._camera) {
                let camera_position = document.getElementById('js-camera-position');
                let pos = scene_info._camera.position;
                camera_position.textContent = "(" + pos.x + ", " + pos.y + ", " + pos.z + ")";
            }
        }
        animate();

        if (enable_debug) {
            this._EnableDebug();
        }
    }

    /**
     * Adds a model to the scene
     * @param {Mesh} 3js mesh to add to the scene
     */
    AddModel(model) {
        this._scene.add(model);
    }

    _EnableDebug() {
        const axesHelper = new AxesHelper( 5 );
        this._scene.add( axesHelper );

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
    }
}

export default ThreeScene;
