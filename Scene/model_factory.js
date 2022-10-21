import Database from '../Images/database.js';
import Model from './model.js';
import { LoadTexture } from './three/texture_loader.js';

/**
 * The model factory is used to build 3D models that can be added
 * to a 3js scene
 */
class ModelFactory {
    /**
     * Returns a Solar Model for the given parameters. Or null if there are no images available
     * for the given time range
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @returns {Model} Model representing the sun, or null if no data is available
     */
    async CreateSolarModel(source, start, end, cadence, scale) {
        /*
        source = 13;
        start = new Date("2022-01-01");
        end = new Date("2022-02-01");
        cadence = 3600 * 24;
        scale = 8;
        */
        try {
            let image_promises = Database.GetImages(source, start, end, cadence, scale);
            let textures = await this._CreateTextures(image_promises);
            return new Model(textures, source);
        } catch (e) {
            throw 'Failed to create model: ' + e
        }
    }

    /**
     * @typedef {Object} HeliosTexture
     * @property {Date} date Date of the image
     * @property {Texture} texture Threejs texture
     * @property {Coordinates} position Position of the observer of the image
     * @property {JP2info} jp2info Metadta about the source of this texture
     */
    /**
     * Uses 3js to create textures out of image data
     * @private
     *
     * @param {Array<Promise<HeliosImage>>} data_promises data to create textures from
     * @returns {HeliosTexture[]} Texture data for models to use
     */
    async _CreateTextures(data_promises) {
        let result = [];
        let texture_promises = [];
        // LoadTexture is async, so this first iteration
        // fires off the load texture requests
        for (const promise of data_promises) {
            texture_promises.push(promise.then((image) => {
                if (image) {
                    let texture = LoadTexture(image.url);
                    return {
                        date: image.date,
                        texture: texture,
                        jp2info: image.jp2info,
                        position: image.position
                    };
                } else {
                    return false;
                }
            }));
        }

        // Wait for async calls to complete.
        for (const promise of texture_promises) {
            let value = await promise;
            // Value may be false since promises have been chained all the way up to this point.
            // Duplicate results are ignored and return false up the promise chain.
            if (value) {
                result.push(value);
            }
        }

        for (const image of result) {
            image.texture = await image.texture;
            image.position = await image.position;
        }
        return result;
    }
}

let factory = new ModelFactory();
export default factory;

