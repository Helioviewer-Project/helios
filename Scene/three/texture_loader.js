import {TextureLoader} from 'three';

/**
 * Keep one texture loader initialized.
 * @private
 */
let loader = new TextureLoader();

/**
 * Asynchronously loads a url into a 3js texture
 * @param {string} url URL to the image to be loaded as a texture
 */
function LoadTexture(url) {
    return new Promise((resolve, reject) => {
        loader.load(url,
        // on success
        (texture) => resolve(texture),
        // onProgress is not supported by threejs
        undefined,
        // on error
        (result) => reject(result));
    });
}

export { LoadTexture };

