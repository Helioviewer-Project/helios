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
    async GetImages(source, start, end, cadence, scale) {
        // Use Helioviewer API to query for image ids
        let images = await Helioviewer.QueryImages(source, start, end, cadence);
        // Iterate over image IDs and query GetImageURL to create
        // a list of URLs.
        let url_info = [];
        for (const image of images) {
            url_info.push({
                url: Helioviewer.GetImageURL(image.id, scale),
                timestamp: image.timestamp
            });
        }
        // Return url list
        return url_info;
    }
}

let finder = new ImageFinder();
export default finder;

