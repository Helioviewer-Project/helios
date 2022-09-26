import Config from "../Configuration.js";

/**
 * Returns the observer for a given data source ID
 * i.e. AIA/HMI sources will return "SDO"
 * This observer can be passed through to the Geometry Service
 * @param {number} source Telescope source ID
 * @returns {string} Observer name
 */
function GetObserverFromSource(source) {
    // This takes advantage of the front-end already having a dropdown with each observer/source pair
    let select = document.getElementById(Config.source_selector_id);
    let option = select.querySelector("[value='"+source+"']");
    if (option) {
        return option.textContent;
    } else {
        return "Unknown Source";
    }
}

export {GetObserverFromSource};
