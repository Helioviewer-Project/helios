/**
 * This module contains a collection of math functions that are useful, but not built-in.
 */

/**
 * Degrees to radians
 */
function deg2rad(deg) {
    return deg*Math.PI/180;
}

/**
 * Radians to degrees
 */
function rad2deg(rad) {
    return rad * 180 / Math.PI;
}

/**
 * milliseconds to seconds
 */
function ms2sec(ms) {
    return ms / 1000;
}

/** 
 * Seconds to minutes
 */
function sec2min(s) {
    return s / 60;
}

/**
 * Minutes to hours
 */
function min2hour(m) {
    return m / 60;
}

/**
 * Hours to days
 */
function hour2day(h) {
    return h / 24;
}

/**
 * Milliseconds to days
 */
function ms2day(ms) {
    // Hello functional programming
    return hour2day(min2hour(sec2min(ms2sec(ms))));
}

export {
    ms2day,
    deg2rad,
    rad2deg
};
