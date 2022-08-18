import Config from '../Configuration.js';
import ThreeScene from './three/three_scene.js';
import ModelFactory from './model_factory.js';

/**
 * Manages the full 3js scene that is rendered.
 */
class Scene {
    constructor() {
        /**
         * Threejs implementation of the scene
         */
        this._scene = new ThreeScene(Config.viewport_id);

        /**
         * Mapping of ids to models for the UI to reference scene objects
         * @private
         */
        this._models = {};

        /**
         * Current model count used for creating IDs
         * @private
         */
        this._count = 0;

        /**
         * Current scene time.
         * @private
         */
        this._current_time = new Date();
    }

    /**
     * Adds a new source to the scene
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @returns {number} identifier for model in the scene
     */
    async AddToScene(source, start, end, cadence, scale) {
        let sun = await ModelFactory.CreateSolarModel(source, start, end, cadence, scale);
        let model = sun.GetModel();
        this._scene.AddModel(model);

        let id = this._count++;
        this._models[id] = sun;
        sun.SetTime(this._current_time);
        return id;
    }

    /**
     * Removes a model from the scene
     * @param {number} id Identifier of model to remove
     */
    RemoveFromScene(id) {
        // TODO: Remove model matching the given id from the scene
    }

    /**
     * Locks the camera to a specific model's observer
     * @param {number} id Identifier of model to track the camera to.
     */
    LockCamera(id) {
    }

    /**
     * Unlocks the camera position from whichever model it is locked to.
     */
    UnlockCamera() {
    }

    /**
     * Update the scene to the specified time
     * @param {Date} date New scene time
     */
    SetTime(date) {
        let ids = Object.keys(this._models);
        for (const id of ids) {
            this._models[id].SetTime(date);
        }
        this._current_time = date;
    }

    /**
     * Returns the current time of the scene
     * @returns {Date} scene time
     */
    GetCurrentTime() {
        return this._current_time;
    }
}

// There is only one scene in the application
let scene = new Scene();
export default scene;

