import Config from "../Configuration.js";

function _GetResolutionIndex(source_id) {
    if (source_id >= 100000) {
        return 0;
    }
    if (Config.source_resolutions.hasOwnProperty(source_id)) {
        return source_id;
    } else {
        // Get the index for the ID below this one.
        return _GetResolutionIndex(source_id - 1);
    }
}

function _GetBaseImageResolution(source_id) {
    let idx = _GetResolutionIndex(source_id);
    return Config.source_resolutions[idx];
}

/**
 * Returns the appropriate Image Scale given a resolution choice and Source ID
 * @param {number} resolution Resolution in pixels square.
 * @param {number} source Data source ID
 */
function GetImageScaleForResolution(resolution, source) {
    let scale = _GetBaseImageResolution(source) / resolution;
    // Clamp scale to 1. Less than 1 will apply artificial "upscaling" to the image
    // This wastes by returning a larger image with no quality improvement
    if (scale < 1) {
        scale = 1;
    }
    return scale;
}

export { GetImageScaleForResolution };
