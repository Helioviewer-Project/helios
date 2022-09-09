import Helioviewer from '../API/helioviewer.js';

/**
 * Searches helioviewer for images to use
 */
class ImageFinder {

    /**
     * Checks if the given url is new to the list
     * @param {UrlInfo[]} urls Array of url objects
     * @param {string} url_to_check The URL to search for in the list
     * @returns true if url_to_check is not in urls
     */
    _isNewUrl(urls, url_to_check) {
        // Check if the url is in the list
        const found = urls.find(el => el.url == url_to_check);
        // If found is undefined, then the url is a new url
        return found == undefined;
    }

    /**
     * @typedef {Object} UrlInfo
     * @property {number} id Image ID
     * @property {string} url URL to an image
     * @property {Date} timestamp Timestamp associated with the image
     * @property {JP2Info} jp2info metadata about the image
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
            let url = Helioviewer.GetImageURL(image.id, scale);

            // ignore duplicates
            if (this._isNewUrl(url_info, url)) {
                url_info.push({
                    id: image.id,
                    url: url,
                    timestamp: image.timestamp,
                    jp2info: image.jp2_info
                });
            }
        }

        // Return url list
        return url_info;
    }
}

let finder = new ImageFinder();
export default finder;

