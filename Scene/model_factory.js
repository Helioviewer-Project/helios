import Database from '../Images/database.js';
import Sun from './sun.js';
import { LoadTexture } from './three/texture_loader.js';

/**
 * The model factory is used to build 3D models that can be added
 * to a 3js scene
 */
class ModelFactory {
    /**
     * Returns a Solar Model for the given parameters
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     */
    async CreateSolarModel(source, start, end, cadence, scale) {
        let images = Database.GetImages(source, start, end, cadence, scale);
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
        // TODO: iterate over images and use 3js to create texture
        //       data
        let result = [];
        for (const image of images) {
            let texture = await LoadTexture(image.url);
            result.push({
                date: image.date,
                texture: texture,
                observer_position: image.observer_position
            });
        }
        return result;
    }
}

let factory = new ModelFactory();
export default factory;

