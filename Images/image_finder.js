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
     * @returns {Array<Promise<UrlInfo>>} Either the urlinfo itself, or false if it's a duplicate to be ignored.
     */
    GetImages(source, start, end, cadence, scale) {
        // Use Helioviewer API to query for image ids
        let image_query_promises = Helioviewer.QueryImages(source, start, end, cadence);
        // Iterate over image IDs and query GetImageURL to create
        // a list of URLs.
        let url_info = [];
        let results = [];
        for (const promise of image_query_promises) {
            // Using "then" rather than await because I want to return a list of promises immediately
            // Making this function async and using await would return one promise that completes when all the subpromises are done.
            // What I want to achieve is extreme parallelization, so I want to tell each promise what to do when they're done, and return a new list of promises.
            results.push(promise.then((image) => {
                let url = Helioviewer.GetImageURL(image.id, scale);

                // ignore duplicates
                if (this._isNewUrl(url_info, url)) {
                    let result = {
                        id: image.id,
                        url: url,
                        timestamp: image.timestamp,
                        jp2info: image.jp2_info
                    };
                    url_info.push(result);
                    return result;
                }
                return false;
            }));
        }

        // Return url list
        return results;
    }
}

let finder = new ImageFinder();
export default finder;

