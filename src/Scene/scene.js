import Config from "../Configuration.js";
import {ThreeScene} from "./three/three_scene";
import ModelFactory from "./model_factory.js";
import { GetImageScaleForResolution } from "../common/resolution_lookup.js";
import Loader from "../UI/loader.js";
import EventManager from "../Events/event_manager.js";

/**
 * Manages the full 3js scene that is rendered.
 */
export default class Scene {
    constructor(viewport_id) {
        /**
         * Threejs implementation of the scene
         * @private
         */
        this._scene = new ThreeScene(viewport_id);

        /**
         * List of callback functions waiting for the time to update
         * @private
         */
        this._time_listeners = {};

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

        /**
         * Model that camera is locked on to.
         * @private
         */
        this._camera_lock = null;
    }

    /**
     * Returns the overall time range of all objects in the scene.
     * @returns {Date[]} Where date[0] is min and date[1] is max.
     */
    GetTimeRange() {
        let ids = Object.keys(this._models);
        if (ids.length > 0) {
            let min_date = new Date(this._models[ids[0]].startTime);
            let max_date = new Date(this._models[ids[0]].endTime);
            for (const id of Object.keys(this._models)) {
                let model = this._models[id];
                // Find min
                if (model.startTime < min_date) {
                    min_date = new Date(model.startTime);
                }
                // Find max
                if (model.endTime > max_date) {
                    max_date = new Date(model.endTime);
                }
            }
            return [min_date, max_date];
        } else {
            throw "No models in the scene";
        }
    }


    /**
     * Adds a new source to the scene
     *
     * @param {number} source Observatory source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @param {number} layer_order Layer order of the image in the scene.
     *
     * @typedef {Object} ModelInfo
     * @param {number} id Model identifier
     * @param {number} source Observatory source ID
     * @param {Date} startTime Requested start time for this model
     * @param {Date} endTime Requested end time for this model
     * @param {number} order Layer order number. Higher number appears in front of smaller numbers
     * @param {number} cadence Requested cadence for this model
     * @param {number} scale Requested image scale
     * @returns {ModelInfo} Newly added model information
     */
    async AddToScene(source, start, end, cadence, scale, layer_order) {
        try {
            // Start the loading animation
            Loader.start();
            let sun = await ModelFactory.CreateSolarModel(source, start, end, cadence, scale, this._scene.GetTextureInitFunction());
            let model = await sun.GetModel();
            this._scene.AddModel(model);

            let id = this._count++;
            this._models[id] = {
                id: id,
                source: source,
                startTime: start,
                endTime: end,
                model: sun,
                order: layer_order,
                cadence: cadence,
                scale: scale
            };
            if (Object.keys(this._models).length == 1) {
                this._scene.MoveCamera(sun.GetObserverPosition());
                this._scene.PointCamera(await sun.GetPosition());
                this.SetTime(start);
            }

            sun.SetTime(this._current_time);
            this._SortLayers();
            // End the loading animation
            Loader.stop();
            this._UpdateEvents();
            return this._models[id];
        } catch (e) {
            Loader.stop();
            throw e;
        }
    }

    AddModel(model) {
        this._scene.AddModel(model);
    }

    async _UpdateEvents() {
        // TODO: Enable events
        // EventManager.SetTimeRange(this.GetTimeRange());
    }

    /**
     * Updates the current scene with new resolution
     *
     * @param {number} resolution
     */
    async UpdateResolution(resolution) {
        for (let id in this._models) {
            const model = this._models[id];
            // get the id of new scene
            let new_id = await this.AddToScene(model.model.source, model.startTime, model.endTime, model.cadence, GetImageScaleForResolution(resolution, model.model.source), model.order);
            await this.RemoveFromScene(id);
            // overwrite the original with the new_id
            this._models[id] = this._models[new_id];
            // remove the new scene
            delete this._models[new_id];
        }
    }

    /**
     * Set the model's layering order so they appear correctly in the scene.
     */
    _SortLayers() {
        let keys = Object.keys(this._models);
        for (const id of keys) {
            this._models[id].model.SetLayerOrder(this._models[id].order, keys.length);
        }
    }

    /**
     * Removes a model from the scene
     * @param {number} id Identifier of model to remove
     */
    async RemoveFromScene(id) {
        let model_to_remove = await this._models[id].model.GetModel();
        this._scene.RemoveModel(model_to_remove);
        // Free assets related to the model
        this._models[id].model.dispose();
        delete this._models[id];
        // Removing the model from the scene may change the time range of the scene, and the events must be updated to handle this.
        this._UpdateEvents();
    }

    /**
     * Locks the camera to a specific model's observer
     * @param {number} id Identifier of model to track the camera to.
     */
    LockCamera(id) {
        this._camera_lock = this._models[id];
    }

    /**
     * Unlocks the camera position from whichever model it is locked to.
     */
    UnlockCamera() {
        this._camera_lock = null;
    }

    /**
     * Update the scene to the specified time
     * @param {Date} date New scene time
     */
    async SetTime(date) {
        this._current_time = date;

        let ids = Object.keys(this._models);
        for (const id of ids) {
            await this._models[id].model.SetTime(date);
        }

        // If camera is locked on to a specific model, then update its position.
        // This must happen after the model time updates have completed.
        if (this._camera_lock) {
            this._scene.MoveCamera(this._camera_lock.model.GetObserverPosition(), true);
            this._scene.PointCamera(await this._camera_lock.model.GetPosition());
        }

        for (const id of Object.keys(this._time_listeners)) {
            this._time_listeners[id](this._current_time);
        }
    }

    /**
     * Returns the current time of the scene
     * @returns {Date} scene time
     */
    GetTime() {
        return this._current_time;
    }

    _CreateId() {
        return this._count++;
    }

    /**
     * Registers a callback to be executed when the scene time is updated
     * @param {Function} fn Callback function that takes a date as a parameter
     */
    RegisterTimeUpdateListener(fn) {
        let id = this._CreateId();
        this._time_listeners[id] = fn;
        fn(this._current_time);
        return id;
    }

    /**
     * Unregisters a callback to be executed when the scene time is updated
     * @param {number} id ID returned by RegisterTimeUpdateListener
     */
    UnregisterTimeUpdateListener(id) {
        delete this._time_listeners[id];
    }

    /**
     * Returns the timestamp of a given model
     * @param {number} id ID of the model returned by AddToScene
     * @return {Date}
     */
    GetModelTime(id) {
        return this._models[id].model.current_time;
    }

    /**
     * Updates the opacity of the model associated with the given ID
     * @param {number} id ID returned from AddToScene
     * @param {number} opacity New opacity to apply to the model
     */
    SetModelOpacity(id, opacity) {
        this._models[id].model.SetOpacity(opacity);
    }

    /**
     * Notifies objects in the scene to reset to the current time.
     */
    Refresh() {
        this.SetTime(this.GetTime());
    }

    /**
     * Returns the maximum number of frames.
     */
    GetMaxFrameCount() {
        // this._models is a json object, not an array, so we need to get keys to iterate over it.
        let ids = Object.keys(this._models);
        if (ids.length > 0) {
            // Get the initial frame count
            let max = this._models[ids[0]].model.GetFrameCount();
            // Simple linear search to find the maximum.
            for (const id of ids) {
                let solar_object = this._models[id];
                let count = solar_object.model.GetFrameCount();
                if (count > max) {
                    max = count;
                }
            }

            return max;
        } else {
            throw "No models available";
        }
    }

    /**
     * A single layer in the scene with information needed to recreate the scene
     * @typedef {Object} SceneLayer
     * @property {number} source - Source ID.
     * @property {Date} start - Beginning of time range
     * @property {Date} end - End of time range
     * @property {number} cadence - amount of time between frames
     * @property {number} scale - Image scale
     */
    /**
     * Returns all current layers in the scene
     * @returns {SceneLayer[]} Array of layers
     */
    GetLayers() {
        let layers = [];
        let ids = Object.keys(this._models);
        for (const id of ids) {
            let model = this._models[id];
            layers.push({
                source: model.source,
                start: model.startTime,
                end: model.endTime,
                cadence: model.cadence,
                scale: model.scale
            });
        }
        return layers;
    }
}
