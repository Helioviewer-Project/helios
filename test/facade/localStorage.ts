/**
 * Implements dummy localStorage for testing purposes
 * Does not serialize to disk.
 */

let storage = {};

global.localStorage = {
    getItem: (key: string) => {
        if (storage.hasOwnProperty(key)) {
            return storage[key];
        } else {
            return null;
        }
    },

    setItem: (key: string, value: string) => {
        storage[key] = value;
    },
}