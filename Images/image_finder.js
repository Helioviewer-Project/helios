import Helioviewer from '../API/helioviewer.js';

/**
 * Searches helioviewer for images to use
 */
class ImageFinder {
    /**
     * @typedef {Object} UrlInfo
     * @property {string} url URL to an image
     * @property {Date} timestamp Timestamp associated with the image
     */
    /**
     * Queries helioviewer for a list of images
     *
     * @param {number} source ID for the telescope's source
     * @param {Date} start Start time of range to query
     * @param {Date} end End time of range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale of images to download
     * @returns {UrlInfo[]}
     */
    GetImages(source, start, end, cadence, scale) {
        // TODO: Use Helioviewer API to query for image ids
        // Iterate over image IDs and query GetImageURL to create
        // a list of URLs.
        // Return url list
        return [];
    }
}

let finder = new ImageFinder();
export default finder;

