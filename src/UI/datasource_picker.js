import Config from '../Configuration.js';
import HTML from '../common/html.js'

/**
 * UI component for choosing the telescope sources
 */
class DatasourcePicker {
    /**
     * Constructs a datasource picker
     */
    constructor() {
        this._selector = HTML.source_selector;
    }

    /**
     * Returns the currently selected data source
     *
     * @returns {number}
     */
    GetDatasource() {
        let value = this._selector.value;
        return Number(value);
    }
}

let picker = new DatasourcePicker();
export default picker;

