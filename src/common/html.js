import Config from '../Configuration.js';

/**
 * This module loads references to all of the UI elements that Helios uses so that document.getElementBy* doesn't need to be used repeatedly.
 * If anything is missing, add it here.
 */
class HTML {
    constructor() {
        this.viewport = document.getElementById(Config.viewport_id);
        this.loader = document.getElementById(Config.loader_id);
    }
};

let instance = new HTML();
export default instance;