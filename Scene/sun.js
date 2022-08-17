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
        this.data = data;
        this.current_time = this.data[0].date;
        this._InitializeModel();
    }

    /**
     * Constructs a 3js model for rendering
     * @private
     */
    _InitializeModel() {
        // TODO: Implement 3js model creation for hemisphere, and apply
        //       the texture to it.

        // Update the texture/rotational position
        this._Update();
    }

    /**
     * Updates the current texture and rotational direction based
     * on the current time
     * @private
     */
    _Update() {
        // TODO: Find the data closest to this.current_time
        // Update the texture on the model to the date's texture
        // Update the rotation of the model to the date's observer position
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
    GetModel() {
        // TODO: Return 3js model
        return {};
    }
};

