function _inclusive_between(value, min, max) {
    return (min <= value) && (value <= max);
}

function _GetBaseImageResolution(source_id) {
    if (_inclusive_between(source_id, 8, 19)) {
        // SDO Images are between source IDs 8 to 19.
        // These images are 4k in size
        return 4096;
    } else if (_inclusive_between(source_id, 4, 5)) {
        // SOHO LASCO images are 1024x1024 in size. These IDs are 4 and 5
        return 1024;
    } else {
        // By default assume 4096. This may result in bad scaling if it's not correct.
        console.log("Source ID " + source_id + " not defined in resolution lookup table, please notify the developers to add it.");
        return 4096;
    }
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

export {GetImageScaleForResolution};
