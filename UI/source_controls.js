import DateRangePicker from './date_range_picker.js';
import DatasourcePicker from './datasource_picker.js';
import ResolutionPicker from './resolution_picker.js';
import Scene from '../Scene/scene.js';

/**
 * Manages current sources displayed in the scene
 */
class SourceManager {
    constructor() {
        /**
         * Stores the IDs of layers that have been added to the scene
         */
        this._layers = [];
    }

    /**
     * Adds a source to the scene
     */
    AddSource() {
        let range = DateRangePicker.GetDateRange();
        let source = DatasourcePicker.GetDatasource();
        let resolution = ResolutionPicker.GetResolution();
        let id = Scene.AddToScene(source, range.start, range.end, range.cadence, resolution);
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

let manager = new SourceManager();
export default manager;

