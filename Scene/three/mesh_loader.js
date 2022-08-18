import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

/**
 * Keep one loader initialized.
 * @private
 */
let loader = new STLLoader();

/**
 * Loads an STL mesh from the given path
 *
 * @param {string} path Path to the stl file, relative to site root.
 */
function LoadMesh(path) {
    return new Promise((resolve, reject) => {
        loader.load(url,
        // on success
        (geometry) => resolve(geometry),
        // onProgress is not supported by threejs
        undefined,
        // on error
        (result) => reject(result));
    });
}

export { LoadMesh };

