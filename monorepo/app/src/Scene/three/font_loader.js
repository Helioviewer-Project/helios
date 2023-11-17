import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

/**
 * Keep one loader initialized.
 * @private
 */
let loader = new FontLoader();

function LoadFont(font_url) {
    return new Promise((resolve, reject) => {
        loader.load(
            font_url,
            (font) => {
                resolve(font);
            },
            null,
            (err) => {
                reject(err);
            }
        );
    });
}

export { LoadFont };
