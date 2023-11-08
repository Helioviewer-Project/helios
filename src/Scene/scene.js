import Config from "../Configuration.js";
import { ThreeScene } from "./three/three_scene";
import ModelFactory from "./model_factory.js";
import { GetImageScaleForResolution } from "../common/resolution_lookup.js";
import Loader from "../UI/loader.js";

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
         * @type HeliosCamera
         */
        this._camera = this._scene.GetCamera();

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
         * Generic assets being managed by the scene.
         * @TODO existing sun models should conform to the asset interface spec.
         */
        this._assets = {};

        this._asset_loaders = [];

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
     * @param {string} format Image format
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
    async AddToScene(source, start, end, cadence, scale, format, layer_order) {
        try {
            // Start the loading animation
            Loader.start();
            let model = await ModelFactory.CreateModel(
                source,
                start,
                end,
                cadence,
                scale,
                format,
                this._scene.GetTextureInitFunction(),
                this
            );
            this._scene.AddModel(await model.GetModel());

            let id = this._CreateId();
            this._models[id] = {
                id: id,
                source: source,
                startTime: start,
                endTime: end,
                model: model,
                order: layer_order,
                cadence: cadence,
                scale: scale,
            };

            if (Object.keys(this._models).length == 1) {
                let camera_target = await model.GetPosition();
                let camera_position = (
                    await model.GetObserverPosition()
                ).toVector3();
                this._camera.Move(camera_position, camera_target, () => {
                    this._camera.SaveState(camera_target);
                });
                this.SetTime(start);
            }

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

    ResetCamera() {
        this._camera.LoadState();
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
            let new_id = await this.AddToScene(
                model.model.source,
                model.startTime,
                model.endTime,
                model.cadence,
                GetImageScaleForResolution(resolution, model.model.source),
                model.order
            );
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
            this._models[id].model.SetLayerOrder(this._models[id].order);
        }
    }

    /**
     * Removes a model from the scene
     * @param {number} id Identifier of model to remove
     */
    async RemoveFromScene(id) {
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
        ids = Object.keys(this._assets);
        for (const id of ids) {
            this._assets[id].SetTime(date);
        }

        // If camera is locked on to a specific model, then update its position.
        // This must happen after the model time updates have completed.
        if (this._camera_lock) {
            this._camera.Jump(
                this._camera_lock.model.GetObserverPosition(),
                await this._camera_lock.model.GetPosition()
            );
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
            return 0;
        }
    }

    /**
     * Add a generic asset to the scene.
     * By default, the asset's model is added to the global scene.
     * If you need finer control on how the model is added, then supply a CustomAssetAdder.
     *
     * The asset instance must adhere to the asset interface specification (see assets folder).
     *
     * @param {Asset} asset
     * @returns {number} Asset ID
     */
    async AddAsset(asset) {
        // Add the asset renderable object to the scene
        let model = await asset.GetRenderableModel();
        this._scene.AddModel(model);
        // Track the asset
        let id = this._CreateId();
        this._assets[id] = asset;
        return id;
    }

    /**
     * Removes an asset that has been previously added to the scene
     * @param {number} id
     */
    async DeleteAsset(id) {
        let model = await this._assets[id].GetRenderableModel();
        model.removeFromParent();
        delete this._assets[id];
    }

    /**
     * Registers an asset loader.
     * @param {AssetLoader} loader Instance which implements the AssetLoader Interface.
     */
    RegisterAssetLoader(loader) {
        this._asset_loaders.push(loader);
    }

    async _LoadAssets(start, end, cadence) {
        let promises = [];
        // Iterate over all asset loaders and request their data
        for (const loader of this._asset_loaders) {
            // Check if the sources associated with the asset are in the scene, and trigger a load of the assets that are.
            let asset_sources = loader.GetAssociatedSources();
            let scene_sources = this.GetCurrentSources();
            if (scene_sources.some((id) => asset_sources.includes(id))) {
                promises.push(loader.AddTimeSeries(start, end, cadence, this));
            }
        }
        // Wait for all assets to finish loading
        for (const promise of promises) {
            await promise;
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
                scale: model.scale,
            });
        }
        return layers;
    }

    /**
     * Creates a thumbnail out of the current camera view
     */
    async CreateThumbnail() {
        return this._scene.CreateThumbnailFromCamera();
    }

    TakeScreenshot() {
        this._scene.TakeScreenshot();
    }

    ToggleAxesHelper() {
        return this._scene.ToggleAxesHelper();
    }

    /**
     * Returns a list of the current sources IDs in the scene.
     */
    GetCurrentSources() {
        let models = Object.entries(this._models);
        return models.map((m) => m[1].model.source);
    }

    /**
     * Returns a model from an observatory along the sun-earth line that has been added to the scene.
     */
    GetSourceWithEarthPerspective() {
        let models = Object.entries(this._models);
        let available_earth_sources = models.filter((m) =>
            Config.earth_sources.includes(m[1].model.source)
        );
        return available_earth_sources[0][1].model;
    }
}
