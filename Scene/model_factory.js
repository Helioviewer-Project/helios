import Database from '../Images/database.js';
import Sun from './sun.js';
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
     * @returns {Sun} Model representing the sun, or null if no data is available
     */
    async CreateSolarModel(source, start, end, cadence, scale) {
        /*
        source = 13;
        start = new Date("2022-01-01");
        end = new Date("2022-02-01");
        cadence = 3600 * 24;
        scale = 8;
        */
        console.log(source, start, end, cadence, scale);
        try {
            var images = await Database.GetImages(source, start, end, cadence, scale);
        } catch (e) {
            throw 'Failed to create model: ' + e
        }
        // If there's no image data available, then return nothing
        // The should bubble up to the UI code which must alert the user
        // that their search returned nothing.

        let textures = await this._CreateTextures(images);
        return new Sun(textures);
    }

    /**
     * @typedef {Object} HeliosTexture
     * @property {Date} date Date of the image
     * @property {Texture} texture Threejs texture
     * @property {Coordinates} observer_position Position of the observer of the image
     */
    /**
     * Uses 3js to create textures out of image data
     * @private
     *
     * @param {HeliosImage[]} Image data to create textures from
     * @returns {HeliosTexture[]} Texture data for models to use
     */
    async _CreateTextures(images) {
        let result = [];
        // LoadTexture is async, so this first iteration
        // fires off the load texture requests
        for (const image of images) {
            let texture = LoadTexture(image.url);
            result.push({
                date: image.date,
                texture: texture,
                observer_position: image.observer_position
            });
        }

        // Wait for async calls to complete.
        for (const image of result) {
            image.texture = await image.texture;
        }
        return result;
    }
}

let factory = new ModelFactory();
export default factory;

