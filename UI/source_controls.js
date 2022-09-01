import Config from '../Configuration.js';
import DateRangePicker from './date_range_picker.js';
import DatasourcePicker from './datasource_picker.js';
import ResolutionPicker from './resolution_picker.js';
import Scene from '../Scene/scene.js';

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
        //       validation can be done in the respective modules.
        source = 13;
        range.start = new Date("2021-01-01T00:00:00Z");
        range.end = new Date("2021-01-03T00:00:00Z");
        range.cadence = 3600 * 24;
        resolution = 8;
        try {
            let id = await Scene.AddToScene(source, range.start, range.end, range.cadence, resolution);
        } catch (e) {
            console.error(e);
            // TODO: Use a nicer error method than alert
            alert("Couldn't load images for the given time range");
            return;
        }
        this._layers.push(id);
    }

    /**
     * Removes a source from the scene with the id returned from
     * Scene.AddToScene
     *
     * @param {number} id ID of the source to remove
     */
    RemoveSource(id) {
        Scene.RemoveFromScene(id);
    }
}

let manager = new SourceManager(Config.add_source_btn_id);
export default manager;

