import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

/**
 * Keep one loader initialized.
 * @private
 */
let loader = new STLLoader();

/**
 * Cache for meshes so that the same ones aren't reloaded
 * every time they're needed
 * @private
 */
let cache = {};

/**
 * Loads an STL mesh from the given path
 *
 * @param {string} path Path to the stl file, relative to site root.
 */
function LoadMesh(path) {
    if (cache.hasOwnProperty(path)) {
        return cache[path];
    } else {
        return new Promise((resolve, reject) => {
            loader.load(path,
            // on success
            (geometry) => {
                cache[path] = geometry;
                resolve(geometry);
            },
            // onProgress is not supported by threejs
            undefined,
            // on error
            (result) => reject(result));
        });
    }
}

export { LoadMesh };

