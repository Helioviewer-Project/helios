import Config from '../Configuration.js';
import {ToAPIDate} from "../common/dates.js";
import Coordinates from '../common/coordinates.js';

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
     * Queries the helioviewer API for the image nearest to the given time.
     * @param {number} source Telescope source ID
     * @param {Date} time Timestamp to query
     * @returns {ImageInfo}
     * @private
     */
    async _GetClosestImage(source, time) {
        let api_url = this.GetApiUrl() + "getClosestImage/?sourceId=" + source + "&date=" + ToAPIDate(time);
        let result = await fetch(api_url);
        let image = await result.json();
        // Add the Z to indicate the date is a UTC date. Helioviewer works in UTC
        // but doesn't use the formal specification for it.
        return {id: image.id, timestamp: new Date(image.date + "Z")};
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
    async QueryImages(source, start, end, cadence) {
        let results = [];
        let query_time = new Date(start);

        // Iterate over the time range, adding "cadence" for each iteration
        while (query_time <= end) {
            // Query Helioviewer for the closest image to the given time.
            // Sends the request off and store the promise
            let image_promise = this._GetClosestImage(source, query_time);
            // Add the result to the output array
            results.push(image_promise);
            // Add cadence to the query time
            // A neat trick for setSeconds is if seconds > 60, it proceeds to update
            // the minutes, hours, etc.
            query_time.setSeconds(query_time.getSeconds() + cadence);
        }

        // Iterate over the promise array, and update the values with the actual
        // queried values
        for (let i = 0; i < results.length; i++) {
            results[i] = await results[i];
        }

        return results;
    }

    /**
     * @typedef {Object} JP2Info
     * @property {number} width Original jp2 image width
     * @property {number} height Original jp2 image height
     * @property {number} solar_center_x x coordinate of the center of the sun within the jp2
     * @property {number} solar_center_y y coordinate of the center of the sun within the jp2
     * @property {number} solar_radius Radius of the sun in pixels
     */
    /**
     * Extracts relevant jp2 header information for a given image ID
     * @param {number} id ID of image
     * @returns {JP2Info}
     */
    async GetJP2Info(id) {
        let api_url = this.GetApiUrl() + "getJP2Header/?id=" + id;
        let result = await fetch(api_url);
        let header_info = await result.text();
        return this._extractJP2InfoFromXML(header_info);
    }

    /**
     * Converts the GetJp2Observer response to our Coordinate object
     * @returns Coordinates
     */
    _toCoordinates(response) {
        let x = response["heeq"]['x'];
        let y = response["heeq"]['y'];
        let z = response["heeq"]['z'];
        return new Coordinates(x, y, z);
    }

    /**
     * Returns the observer position of a jp2 image
     * @param {number} id ID of the jp2 image
     * @returns Coordinates
     */
    async GetJp2Observer(id) {
        let api_url = this.GetApiUrl() + "getObserverPosition/?id=" + id;
        let result = await fetch(api_url);
        let data = await result.json();
        return this._toCoordinates(data);
    }

    /**
     * Extracts relevant helios information from the given jp2 header
     * @param {string} jp2_header_xml XML received via the getJP2Header API
     * @returns {JP2Info}
     */
    _extractJP2InfoFromXML(jp2_header_xml) {
        let parser = new DOMParser();
        let xml = parser.parseFromString(jp2_header_xml, "text/xml");
        return {
            width: parseFloat(xml.getElementsByTagName('NAXIS1')[0].textContent),
            height: parseFloat(xml.getElementsByTagName('NAXIS2')[0].textContent),
            solar_center_x: parseFloat(xml.getElementsByTagName('CRPIX1')[0].textContent),
            solar_center_y: parseFloat(xml.getElementsByTagName('CRPIX2')[0].textContent),
            solar_radius: parseFloat(xml.getElementsByTagName('R_SUN')[0].textContent)
        };
    }

    /**
     * Returns a URL that will return a PNG of the given image
     *
     * @param {number} id The ID of the image to get
     * @param {number} scale The image scale to request in the URL
     * @returns {string} URL of the image
     */
    GetImageURL(id, scale) {
        let url = this.GetApiUrl() + "downloadImage/?id=" + id + "&scale=" + scale;
        return url;
    }
}

let SingletonAPI = new Helioviewer();
export default SingletonAPI;
