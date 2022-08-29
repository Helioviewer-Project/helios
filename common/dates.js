/**
 * Returns a date string usable with the Helioviewer API
 * @param {Date} date Javascript date object
 * @returns {string} Date that can be used in an API request
 */
function ToAPIDate(date) {
    return date.toISOString();
}

export { ToAPIDate };
