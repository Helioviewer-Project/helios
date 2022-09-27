import Config from '../Configuration.js';
import DateRangePicker from './date_range_picker.js';
import DatasourcePicker from './datasource_picker.js';
import ResolutionPicker from './resolution_picker.js';
import Scene from '../Scene/scene.js';
import Loader from './loader.js';
import {ToAPIDate} from '../common/dates.js';
import {GetImageScaleForResolution} from '../common/resolution_lookup.js';
import {GetObserverFromSource} from "../common/observers.js";

/**
 * Manages current sources displayed in the scene
 */
class SourceManager {
    /**
     * @param {string} add_source_btn_id ID of element that will trigger
                                         AddSource when clicked.
     * @param {string} ui_div_id ID of element that will store controls for the scene
     */
    constructor(add_source_btn_id, ui_div_id) {
        /**
         * Stores the IDs of layers that have been added to the scene
         */
        this._layers = [];
        this._add_btn = document.getElementById(add_source_btn_id);
        this._InitializeAddListener();
        this._layer_count = 0;
        this._ui_div = document.getElementById(ui_div_id);
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

    /**
     * Adds a control element to the UI for the given model ID
     * @param {number} id The model ID returned by the scene when a model is added.
     */
    async _AddUIControl(id, source) {
        // Clone the template
        let control_element = this._template.cloneNode(true);
        // Update label info
        control_element.getElementsByClassName("source-label")[0].textContent = source;
        control_element.getElementsByClassName("source-time")[0].textContent = await Scene.GetModelTime(id).toISOString();

        // Use a closure to capture the ID, so that when this button is clicked, the correct ID is removed
        let controller = this;
        control_element.getElementsByClassName("source-remove")[0].addEventListener('click', () => {
            controller.RemoveSource(id);
            control_element.remove();
            // If there's nothing in the Scene, then hide this UI control.
            if (document.getElementsByClassName('data-source').length == 0) {
                this._ui_div.classList.add("hidden");
            }
        });

        control_element.getElementsByClassName("source-opacity")[0].addEventListener('input', (e) => {
            let opacity = parseFloat(e.target.value);
            if (!isNaN(opacity)) {
                controller.UpdateOpacity(id, opacity);
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
        this._add_btn.addEventListener('click', () => {manager.AddSource();});
    }

    /**
     * Adds a source to the scene
     */
    async AddSource() {
        let range = DateRangePicker.GetDateRange();
        let source = DatasourcePicker.GetDatasource();
        let resolution = ResolutionPicker.GetResolution();
        // TODO: Validate range, source, and resolution.
        //       Make sure that the number of images that are going to be searched for is less than some value set in the configuration
        if (this._ValidateDateRange(range)) {
            try {
                // Get the index for this layer.
                this._layer_count += 1;
                let image_scale = GetImageScaleForResolution(resolution, source);
                // Start the loading animation
                Loader.start();
                let id = await Scene.AddToScene(source, range.start, range.end, range.cadence, image_scale, this._layer_count);
                // Add the control element for interacting with this model to the UI
                this._AddUIControl(id, GetObserverFromSource(source));
                // End the loading animation
                Loader.stop();
                // TODO: if source is already being displayed, then this should replace it, rather than just being added on.
                //       Use RemoveFromScene to remove the existing layer before adding it to _layers
                this._layers.push({source: source, id: id});
            } catch (e) {
                Loader.stop();
                console.error(e);
                // TODO: Use a nicer error method than alert
                alert("Couldn't load images for the given time range");
                return;
            }
        }
    }

    /**
     * Checks if the date range is a valid query
     * @param {TimeRange} range
     * @returns {bool}
     */
    _ValidateDateRange(range) {
        // Subtracting dates returns the time between them in milliseconds
        let dt = (range.end - range.start);
        // If the date is negative, it means end is before start, this is bad.
        if (dt < 0) {
            alert("Start time must be before end time.");
            return false;
        }
        // Get the number of dates that will be queried
        // dt is in milliseconds, divide by 1000 to get the result in seconds. Then divide by the cadence
        // to see how many dates will be queried.
        let num_dates = (dt / 1000) / range.cadence;
        let is_valid = num_dates < Config.max_dates_in_query;
        if (!is_valid) {
            alert("This request would result in downloading " + num_dates + " images. The maximum allowed for one query is " + Config.max_dates_in_query + ". Try increasing the cadence.");
            return false;
        }
        return true;
    }

    /**
     * Removes a source from the scene with the id returned from
     * Scene.AddToScene
     *
     * @param {number} id ID of the source to remove
     */
    RemoveSource(id) {
        Scene.RemoveFromScene(id);
        // Use filter to get all elements where id does not match the id we just removed from the scene.
        // This effectively deletes it from the layer list, though it's probably a slow solution.
        // The layer list should ever have more than a few layers in it though, so it's not a big deal.
        // The max number of layers it can have is the max number of datasources we have.
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

let manager = new SourceManager(Config.add_source_btn_id, Config.ui_sources_id);
export default manager;

