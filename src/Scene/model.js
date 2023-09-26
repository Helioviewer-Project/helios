import {
    CreateHemisphereWithTexture,
    CreatePlaneWithTexture,
    UpdateModelTexture,
    UpdateModelOpacity,
    FreeModel,
} from "./three/model_builder.js";

import { Vector3 } from "three";

import Config from "../Configuration.js";

/**
 * Representation of an animatable sun created from image and
 * positional information
 */
class Model {
    /**
     * Construct a sun model from a dataset
     *
     * @param {HeliosTexture[]} data Array of objects containing a date, texture, and observer position
     */
    constructor(data, source) {
        /**
         * Texture data used on this model
         */
        this.data = data;

        /**
         * ID of the model's source
         */
        this.source = source;

        /**
         * The current time being displayed on this model
         */
        this.current_time = this.data[0].date;

        /**
         * Current time in the scene that this model is trying to match.
         * @private
         */
        this._scene_time = this.current_time;

        /**
         * Layering order, determines which mesh gets rendered in front of others
         * @private
         */
        this._layer_order = 0;

        // Initialize the 3js model
        this._InitializeModel();
    }

    /**
     * Constructs a 3js model for rendering
     * @private
     */
    _InitializeModel() {
        if (Config.plane_sources.indexOf(this.source) != -1) {
            this._model = CreatePlaneWithTexture(
                this.data[0].texture,
                this.data[0].jp2info
            );
        } else {
            this._model = CreateHemisphereWithTexture(
                this.data[0].texture,
                this.data[0].jp2info
            );
        }

        // Update the texture/rotational position
        this._Update();
    }

    async GetScale() {
        return (await this.GetModel()).scale;
    }

    /**
     * Updates the current texture and rotational direction based
     * on the current time
     * @private
     */
    async _Update() {
        let data = this._GetDataFromDate(this._scene_time);
        this.current_time = data.date;
        // Get the texture to use from the current time.
        let texture = data.texture;

        // Update the texture on the model to the date's texture
        let model = await this._model;
        UpdateModelTexture(model, texture, this.data[0].jp2info, this.source);

        // Update the rotation of the model to the date's observer position
        this._PointToObserver(model, data.position);
        this._UpdatePositionForLayerOrder();
    }

    /**
     * Rotates the given model to face the observer position
     * @param {Object} model threejs model
     * @param {Coordinates} observer Position of the observer in scene coordinates
     */
    _PointToObserver(model, observer) {
        model.lookAt(new Vector3(observer.x, observer.y, observer.z));
    }

    /**
     * Returns the current observer's position
     * @returns Coordinates
     */
    GetObserverPosition() {
        let data = this._GetDataFromDate(this._scene_time);
        return data.position;
    }

    /**
     * Returns the model's position in the 3D scene
     * @returns {Vector3}
     */
    async GetPosition() {
        return (await this.GetModel()).position;
    }

    /**
     * Searches the object's data for the data point closest to the given date
     * @param {Date} date The date to find in the image list
     * @returns {HeliosImage}
     * @private
     */
    _GetDataFromDate(date) {
        let chosen_index = 0;
        let dt = Math.abs(date - this.data[0].date);
        // To choose the nearest date, iterate over all dates and select
        // the one with the lowest time delta from the given date
        // Start at 1 since 0 was already set above.
        for (let i = 1; i < this.data.length; i++) {
            const stored_date = this.data[i].date;

            let delta = Math.abs(date - stored_date);
            // If the time difference is smaller than the stored time difference,
            // then update to that date.
            if (delta < dt) {
                chosen_index = i;
                dt = delta;
            }
        }
        return this.data[chosen_index];
    }

    /**
     * Sets the current time and triggers an update to the model's texture
     *
     * @param {Date} date New time to display
     */
    async SetTime(date) {
        this._scene_time = date;
        await this._Update();
    }

    /**
     * Returns the 3js model that can be added to the Scene.
     * @returns {Object}
     */
    async GetModel() {
        return await this._model;
    }

    /**
     * Sets the opacity/transparency of the mesh
     * @param {float} opacity Value between 0 and 1.0. 0 is fully transparent, 1.0 is fully opaque
     */
    async SetOpacity(opacity) {
        let model = await this.GetModel();
        UpdateModelOpacity(model, opacity);
    }

    /**
     * Sets the layer order of this object
     * @param {number} index The index of this item in the scene
     */
    async SetLayerOrder(index) {
        this._layer_order = index;
        this._UpdatePositionForLayerOrder();
    }

    async _UpdatePositionForLayerOrder() {
        // Update the small layering offset for the current frame
        let observer_position = this.GetObserverPosition().toVector3();
        let model = await this._model;
        // Get a vector from the object towards its observer
        let direction = observer_position.sub(model.position);
        // Normalize the direction into a unit vector
        direction.normalize();
        // Shift the object towards the observer slightly
        let dp = direction.multiplyScalar(this._layer_order * 0.005);
        model.position.set(dp.x, dp.y, dp.z);
    }

    /**
     * Returns the number of frames attached to this model
     */
    GetFrameCount() {
        return this.data.length;
    }

    /**
     * Cleans up and destroys this model.
     */
    dispose() {
        // Free the model's mesh
        this.GetModel().then((model) => {
            model.removeFromParent();
            FreeModel(model);
        });
        // Free all the image textures
        for (const datum of this.data) {
            datum.texture.dispose();
        }
    }
}

export default Model;
