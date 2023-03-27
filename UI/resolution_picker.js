import Scene from "../Scene/scene.js";
import Config from "../Configuration.js";
import HTML from "../common/html.js";

/**
 * UI component for choosing the resolution
 */
class ResolutionPicker {
    /**
     * Constructs a resolution picker
     */
    constructor() {
        this._selector = HTML.resolution_selector;
        // Use an if block since having the texture picker displayed is optional.
        if (this._selector) {
             // We capture when the user changes the resolution so we can update the scene
            this._selector.addEventListener("change", (e) => {
                let res = this.GetResolution();
                Scene.UpdateResolution(res);
            });
        }
    }

    /**
     * Returns the currently selected resolution
     *
     * @returns {number}
     */
    GetResolution() {
        if (this._selector) {
            let value = this._selector.value;
            return Number(value);
        } else {
            return Config.default_texture_resolution;
        }
    }
}

let picker = new ResolutionPicker();
export default picker;
