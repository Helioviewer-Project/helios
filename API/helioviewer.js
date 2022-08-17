import Config from '../Configuration.js';

/**
 * This module is used for interfacing with the Helioviewer API
 * The goal of this module is to create a javascript interface
 * that can be used to request specific information from Helioviewer
 * that will be used to enable finding images for Helios.
 */

/**
 * Helioviewer API Client.
 * Allows making API calls to the helioviewer server
 */
class Helioviewer {
    /**
     * Gets the API URL used for making requests
     *
     * @returns {string} URL
     */
    GetApiUrl() {
        let url = Config.helioviewer_url;
        if (!url.endsWith('/')) {
            url = url + "/";
        }
        return url + "v2/";
    }

    /**
     * @typedef {Object} ImageInfo
     * @property {number} id Image ID
     * @property {Date} timestamp Timestamp for this image
     */
    /**
     * Returns a list of Image IDs for the specified time range
     *
     * @param {number} source The desired telescope's source Id
     * @param {Date} start Beginning of time range to get images for
     * @param {Date} end End of time range to get images for
     * @param {number} cadence Number of seconds between each image
     * @returns {ImageInfo[]}
     */
    QueryImages(source, start, end, cadence) {
        // TODO Implement real query
        return [
            {id: 61, timestamp: new Date()},
            {id: 62, timestamp: new Date()},
            {id: 63, timestamp: new Date()},
            {id: 64, timestamp: new Date()}
        ];
    }

    /**
     * Returns a URL that will return a PNG of the given image
     *
     * @param {number} id The ID of the image to get
     * @param {number} scale The image scale to request in the URL
     * @returns {string} URL of the image
     */
    GetImageURL(id, scale) {
        let url = this.api_url + "downloadImage/?id=" + id + "&scale=" + scale;
        return url;
    }
}

let SingletonAPI = new Helioviewer();
export default SingletonAPI;
