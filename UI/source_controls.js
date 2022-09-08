import Config from '../Configuration.js';
import DateRangePicker from './date_range_picker.js';
import DatasourcePicker from './datasource_picker.js';
import ResolutionPicker from './resolution_picker.js';
import Scene from '../Scene/scene.js';
import {ToAPIDate} from '../common/dates.js';

/**
 * Manages current sources displayed in the scene
 */
class SourceManager {
    /**
     * @param {string} add_source_btn_id ID of element that will trigger
                                         AddSource when clicked.
     */
    constructor(add_source_btn_id) {
        /**
         * Stores the IDs of layers that have been added to the scene
         */
        this._layers = [];

        this._add_btn = document.getElementById(add_source_btn_id);
        this._InitializeAddListener();
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
                let id = await Scene.AddToScene(source, range.start, range.end, range.cadence, resolution);
                // TODO: if source is already being displayed, then this should replace it, rather than just being added on.
                //       Use RemoveFromScene to remove the existing layer before adding it to _layers
                this._layers.push({source: source, id: id});
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
     * @param {TimeRange} range
     * @returns {bool}
     */
    _ValidateDateRange(range) {
        // Subtracting dates returns the time between them in milliseconds
        let dt = (range.end - range.start);
        // If the date is negative, it means end is before start, this is bad.
        if (dt < 0) {
            alert("End time must be before start.");
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
}

let manager = new SourceManager(Config.add_source_btn_id);
export default manager;

