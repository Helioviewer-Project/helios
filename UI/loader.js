import Config from '../Configuration.js';
import HTML from '../common/html.js';

/**
 * Controller for loading element in the UI
 */
class Loader {
    /**
     * Creates a Loader controller on the element with the given id
     */
    constructor() {
        this._counter = 0;
        this.element = HTML.loader;
    }

    stop() {
        this._counter--;
        if (this._counter == 0) {
            this.element.classList.remove(Config.loader_class);
        }
    }

    start() {
        if (this._counter == 0) {
            this.element.classList.add(Config.loader_class);
        }
        this._counter++;
    }
}
let loader = new Loader();
export default loader;
