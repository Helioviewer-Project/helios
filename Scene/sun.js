import {
    CreateHemisphereWithTexture,
    UpdateModelTexture
} from './three/model_builder.js';

/**
 * Representation of an animatable sun created from image and
 * positional information
 */
class Sun {
    /**
     * Construct a sun model from a dataset
     *
     * @param {HeliosTexture[]} data Array of objects containing a date, texture, and observer position
     */
    constructor(data) {
        /**
         * Texture data used on this model
         */
        this.data = data;

        /**
         * The current time being displayed on this model
         */
        this.current_time = this.data[0].date;

        // Initialize the 3js model
        this._InitializeModel();
    }

    /**
     * Constructs a 3js model for rendering
     * @private
     */
    _InitializeModel() {
        // TODO: Implement 3js model creation for hemisphere, and apply
        //       the texture to it.
        this._model = CreateHemisphereWithTexture(this.data[0].texture);

        // Update the texture/rotational position
        this._Update();
    }

    /**
     * Updates the current texture and rotational direction based
     * on the current time
     * @private
     */
    async _Update() {
        // Get the texture to use from the current time.
        let texture = this._GetTextureFromDate(this.current_time);

        // Update the texture on the model to the date's texture
        let model = await this._model;
        UpdateModelTexture(model, texture);

        // Update the rotation of the model to the date's observer position
        // TODO: Update rotation of model to point towards observer
    }

    /**
     * Searches the object's data for a texture nearing the given date
     * @param {Date} date The date to find in the image list
     * @returns {Texture}
     * @private
     */
    _GetTextureFromDate(date) {
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
        return this.data[chosen_index].texture;
    }

    /**
     * Sets the current time and triggers an update to the model's texture
     *
     * @param {Date} date New time to display
     */
    SetTime(date) {
        this.current_time = date;
        this._Update();
    }

    /**
     * Returns the 3js model that can be added to the Scene.
     * TODO: Update with 3js model for return type
     * @returns {Object}
     */
    async GetModel() {
        // TODO: Return 3js model
        return await this._model;
    }
};

export default Sun;

