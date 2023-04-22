/**
 * Returns a date string usable with the Helioviewer API
 * @param {Date} date Javascript date object
 * @returns {string} Date that can be used in an API request
 */
function ToAPIDate(date) {
    return date.toISOString();
}

/**
 * Takes a UTC date and applies the local time offset to it.
 * You might ask why we need this:
 * Flatpickr (date picker plugin we're using) expects dates to be in local time.
 * Internally helios uses UTC dates for everything, so we need to apply the UTC offset to the local time to get the correct UTC time. And vice versa.
 */
function ToLocalDate(date) {
    let date_copy = new Date(date);
    date_copy.setMinutes(date_copy.getMinutes() + date.getTimezoneOffset());
    return date_copy;
}

/**
 * Converts a localized date (From flatpickr) to a UTC time.
 * Dates are returned in local time, but the datepicker is meant for UTC time.
 * So for example when I (US/Eastern) choose 12:00PM UTC, I am returned 12:00PM Eastern (which is 8am UTC, which is not what I intended to select);
 * This function applies the time zome offset to convert that 12:00PM Eastern into 12:00PM UTC.
 * The function is generic and works for all time zones.
 * @param {Date} date
 */
function ToUTCDate(date) {
    let date_copy = new Date(date);
    date_copy.setMinutes(date_copy.getMinutes() - date.getTimezoneOffset());
    return date_copy;
}

function parseDate(datestr) {
    let numbers = datestr.split(/[^0-9]/);
    // Creating a date this way uses local time, but values are UTC, so offset needs to be applied
    let localdate = new Date(numbers[0], numbers[1]-1, numbers[2], numbers[3], numbers[4], numbers[5]);
    return ToUTCDate(localdate);
}

export { ToAPIDate, ToLocalDate, ToUTCDate, parseDate };
