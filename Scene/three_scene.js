import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer
} from 'three';

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

        /**
         * Renderer instance
         * @private
         */
        this._renderer = new WebGLRenderer();
        this._renderer.setSize(window.innerWidth, window.innerHeight);

        let target = document.getElementById(viewport_id);
        target.appendChild(this._renderer.domElement);
    }
}

export default ThreeScene;
