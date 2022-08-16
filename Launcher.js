import Helios from './Helios.js';

let HeliosInstance;

/**
 * This is the app's entry point. Module code can't be run directly from
 * the inline javascript which is used to initialize Helioviewer. To get
 * the configuration into this module, we bind a function that starts
 * Helios to a custom event which Helioviewer will trigger to launch
 * the app.
 */
document.addEventListener('InitializeHelios', (e) => {
    if (HeliosInstance == undefined) {
        HeliosInstance = new Helios(e.detail.configuration);
    }
});


