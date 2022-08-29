/**
 * Returns the observer for a given data source ID
 * i.e. AIA/HMI sources will return "SDO"
 * This observer can be passed through to the Geometry Service
 * @param {number} source Telescope source ID
 * @returns {string} Observer name
 */
function GetObserverFromSource(source) {
    // TODO: Create a mapping of source id to observer
    return "SDO";
}

export {GetObserverFromSource};
