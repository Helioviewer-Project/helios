import Config from "../Configuration.js";

/**
 * Maps an observatory source name from helioviewer to helios.
 */
function HelioviewerToHelios(source) {
    if (Config.helioviewer_to_helios_names.hasOwnProperty(source)) {
        return Config.helioviewer_to_helios_names[source];
    } else {
        return source;
    }
}

export {HelioviewerToHelios};
