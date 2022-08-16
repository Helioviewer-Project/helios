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
    constructor() {
        this.api_url = "https://api.helioviewer.org/v2/";
    }

    /**
     * Updates the API URL used for making requests
     *
     * @param {string} url The Helioviewer API URL i.e. "https://api.helioviewer.org"
     *                     with no training slash.
     */
    SetApiUrl(url) {
        this.api_url = url + "/v2/";
    }

    /**
     * Returns a list of Image IDs for the specified time range
     *
     * @param {number} source The desired telescope's source Id
     * @param {Date} start Beginning of time range to get images for
     * @param {Date} end End of time range to get images for
     * @param {number} cadence Number of seconds between each image
     */
    QueryImages(source, start, end, cadence) {
        // TODO Implement real query
        return [61,62,64];
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
