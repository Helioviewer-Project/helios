import Config from './Configuration.js';
import './UI/source_controls.js';
import './UI/camera_controls.js';
import './UI/animation_controls.js';
import './UI/scene_time.js';
import './UI/helioviewer_movie.js';

/**
 * This class is the glue between Helioviewer.org and the Helios
 * application. It manages passing along the helioviewer application's
 * configuraiton and creating instances of all the necessary
 * classes that make up the application.
 */
class Helios {
    /**
     * Initializes Helios with the given configuration
     *
     * @param[in] configuration Helioviewer Config
     */
    constructor(configuration) {
        // Initialize the configuration using settings from Helioviewer
        this.configuration = Config.Update({
            helioviewer_url: configuration.backEnd,
        });

        /**
         * Tracks whether helios is currently enabled or disabled
         * @private
         */
        this._enabled = false;

        this._InitializeButton();
    }

    /**
     * Attaches enable/disable event listeners to the button that
     * enables helios
     * @private
     */
    _InitializeButton() {
        this._button = document.getElementById(Config.toggle_button_id);
        if (this._button) {
            let Helios = this;
            this._button.addEventListener('click', () => {
                Helios.Toggle();
            });
        }
    }

    /**
     * Toggles Helios in the viewport
     */
    Toggle() {
        if (this._enabled) {
            this.Disable();
        } else {
            this.Enable();
        }
    }

    /**
     * Enables Helios in the viewport
     */
    Enable() {
        this._enabled = true;
        this._button.classList.add('active');
        document.getElementsByTagName('body')[0].classList.add('helios-enabled');
    }

    /**
     * Disables Helios in the viewport to go back to traditional Helioviewer
     */
    Disable() {
        this._enabled = false;
        this._button.classList.remove('active');
        document.getElementsByTagName('body')[0].classList.remove('helios-enabled');
    }
}

// Using this syntax for export to support jsdoc
export default Helios;
