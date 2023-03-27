import Config from "../Configuration.js";
import DateRangePicker from "./date_range_picker.js";
import DatasourcePicker from "./datasource_picker.js";
import ResolutionPicker from "./resolution_picker.js";
import Scene from "../Scene/scene.js";
import { GetImageScaleForResolution } from "../common/resolution_lookup.js";
import { GetObserverFromSource } from "../common/observers.js";
import HTML from '../common/html.js';

/**
 * Manages current sources displayed in the scene
 */
class SourceManager {
    constructor() {
        /**
         * Stores the IDs of layers that have been added to the scene
         */
        this._layers = [];
        this._add_btn = HTML.add_source_btn;
        this._InitializeAddListener();
        this._layer_count = 0;
        this._ui_div = HTML.ui_sources;
        this._InitUITemplate();
    }

    /**
     * Stores the HTML template for data to be rendered.
     */
    _InitUITemplate() {
        this._template = this._ui_div.getElementsByClassName("template")[0];
        this._template.classList.remove("template");
        // Remove template from DOM, but keep it cached in this._template
        this._template.remove();
    }

    async _UpdateModelTime(id, element) {
        // Update the text in the UI
        let time = await Scene.GetModelTime(id);
        let timeString = time.toISOString().split("T");
        let date = timeString[0];
        let time_str = timeString[1].split(".")[0];
        element.textContent = `${date} ${time_str}`;
        this._ApplyTextColorForTimeDelta(element, time);
    }

    _ApplyTextColorForTimeDelta(element, model_time) {
        // Get the delta between the scene and model time, and update the color accordingly.
        let scene_time = Scene.GetTime();
        let diff = Math.abs(scene_time - model_time);
        element.classList.remove("normal", "warn", "error");
        if (diff < Config.time_warn_threshold) {
            element.classList.add("normal");
        } else if (diff < Config.time_off_threshold) {
            element.classList.add("warn");
        } else {
            element.classList.add("error");
        }
    }

    /**
     * Adds a control element to the UI for the given model ID
     * @param {number} id The model ID returned by the scene when a model is added.
     */
    async _AddUIControl(id, source) {
        let controller = this;
        // Clone the template
        let control_element = this._template.cloneNode(true);
        // Update label info
        control_element.getElementsByClassName("source-label")[0].textContent = source;

        // Set a listener to update this model's timestamp in the UI.
        let time_element = control_element.getElementsByClassName("source-time")[0];
        controller._UpdateModelTime(id, time_element);

        // Register a listener so the UI is updated as the time in the scene changes.
        let listener_id = Scene.RegisterTimeUpdateListener(async () => {
            controller._UpdateModelTime(id, time_element);
        });

        // Use a closure to capture the ID, so that when this button is clicked, the correct ID is removed
        control_element.getElementsByClassName("source-remove")[0].addEventListener("click", () => {
            controller.RemoveSource(id, listener_id);
            control_element.remove();
            // If there's nothing in the Scene, then hide this UI control.
            if (document.getElementsByClassName("data-source").length == 0) {
                this._ui_div.classList.add("hidden");
            }
        });

        // Use a closure to capture the ID, so when the opacity slider is moved, this model is updated.
        control_element.getElementsByClassName("source-opacity")[0].addEventListener("input", (e) => {
            let opacity = parseFloat(e.target.value);
            if (!isNaN(opacity)) {
                controller.UpdateOpacity(id, opacity);
            }
        });

        control_element.getElementsByClassName("source-camera-lock")[0].addEventListener("input", (e) => {
            if (e.target.checked) {
                // Uncheck all other elements
                let locks = document.getElementsByClassName("source-camera-lock");
                for (const checkbox of locks) {
                    if (checkbox != e.target) {
                        checkbox.checked = false;
                    }
                }

                // Lock the camera to this model
                Scene.LockCamera(id);
                Scene.Refresh();
            } else {
                Scene.UnlockCamera();
            }
        });

        // Add to the DOM
        this._ui_div.appendChild(control_element);
        this._ui_div.classList.remove("hidden");
    }

    /**
     * Adds the event listener to the source button to trigger
     * AddSource when clicked.
     * @private
     */
    _InitializeAddListener() {
        let manager = this;
        this._add_btn.addEventListener("click", () => {
            manager.AddSource();
        });
    }

    /**
     * Adds a source to the scene with data from the input elements.
     */
    async AddSource() {
        let range = DateRangePicker.GetDateRange();
        let source = DatasourcePicker.GetDatasource();
        let resolution = ResolutionPicker.GetResolution();
        this.AddSourceWithParams(range.start, range.end, range.cadence, source, resolution);
    }

    /**
     * Adds a source to the scene programmatically. Can be called from other modules.
     * @param {Date} start
     * @param {Date} end
     * @param {number} cadence
     * @param {number|string} source
     * @param {number|string} resolution
     */
    async AddSourceWithParams(start, end, cadence, source, resolution) {
        // TODO: Validate range, source, and resolution.
        //       Make sure that the number of images that are going to be searched for is less than some value set in the configuration
        if (this._ValidateDateRange(start, end)) {
            try {
                // Get the index for this layer.
                this._layer_count += 1;
                let image_scale = GetImageScaleForResolution(resolution, source);
                let id = await Scene.AddToScene(source, start, end, cadence, image_scale, this._layer_count);
                // Add the control element for interacting with this model to the UI
                this._AddUIControl(id, GetObserverFromSource(source));
                // TODO: if source is already being displayed, then this should replace it, rather than just being added on.
                //       Use RemoveFromScene to remove the existing layer before adding it to _layers
                this._layers.push({ source: source, id: id });
            } catch (e) {
                console.error(e);
                // TODO: Use a nicer error method than alert
                alert("Couldn't load images for the given time range");
                return;
            }
        }
    }

    /**
     * Checks if the date range is a valid query
     * @param {Date} start
     * @param {Date} end
     * @returns {bool}
     */
    _ValidateDateRange(start, end) {
        // Subtracting dates returns the time between them in milliseconds
        let dt = end - start;
        // If the date is negative, it means end is before start, this is bad.
        if (dt < 0) {
            alert("Start time must be before end time.");
            return false;
        }
        return true;
    }

    /**
     * Removes a source from the scene with the id returned from
     * Scene.AddToScene
     *
     * @param {number} id ID of the source to remove
     * @param {number} listener_id ID of the registered time update listener
     */
    RemoveSource(id, listener_id) {
        Scene.RemoveFromScene(id);
        Scene.UnregisterTimeUpdateListener(listener_id);
        // Use filter to get all elements where id does not match the id we just removed from the scene.
        // This effectively deletes it from the layer list, though it's probably a slow solution.
        // The layer list should ever have more than a few layers in it though, so it's not a big deal.
        this._layers = this._layers.filter((el) => el.id != id);
    }

    /**
     * Updates the opacity of the model associated with the given ID
     * @param {number} id ID returned from AddToScene
     * @param {number} opacity New opacity to apply to the model
     */
    UpdateOpacity(id, opacity) {
        Scene.SetModelOpacity(id, opacity);
    }
}

let manager = new SourceManager();
export default manager;
