import Config from '../Configuration.js';

/**
 * Controller for loading element in the UI
 */
class Loader {
    /**
     * Creates a Loader controller on the element with the given id
     * @param {string} id HTML ID of the loader
     */
    constructor(id) {
        this.element = document.getElementById(id);
    }

    stop() {
        this.element.classList.remove(Config.loader_class);
    }

    start() {
        this.element.classList.add(Config.loader_class);
    }
}
let loader = new Loader(Config.loader_id);
export default loader;
