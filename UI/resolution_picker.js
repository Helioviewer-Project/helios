import Scene from "../Scene/scene.js";
import Config from "../Configuration.js";

/**
 * UI component for choosing the resolution
 */
class ResolutionPicker {
    /**
     * Constructs a resolution picker
     *
     * @param {string} resolution_select_id HTML id of the resolution select box
     */
    constructor(resolution_select_id) {
        this._selector = document.getElementById(resolution_select_id);
        // We capture when the user changes the resolution so we can update the scene
        addEventListener("change", (e) => {
            let res = this.GetResolution();
            Scene.UpdateResolution(res);
        });
    }

    /**
     * Returns the currently selected resolution
     *
     * @returns {number}
     */
    GetResolution() {
        let value = this._selector.value;
        return Number(value);
    }
}

let picker = new ResolutionPicker(Config.resolution_selector_id);
export default picker;
