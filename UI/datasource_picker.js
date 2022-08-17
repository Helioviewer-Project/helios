import Config from '../Configuration.js';

/**
 * UI component for choosing the telescope sources
 */
class DatasourcePicker {
    /**
     * Constructs a datasource picker
     *
     * @param {string} source_select_id HTML id of the source select box
     */
    constructor(source_select_id) {
        this._selector = document.getElementById(source_select_id);
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

let picker = new DatasourcePicker(Config.source_selector_id);
export default picker;

