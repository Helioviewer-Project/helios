import Database from '../Images/database.js';
import Sun from './sun.js';

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
    CreateSolarModel(source, start, end, cadence, scale) {
        let images = Database.GetImages(source, start, end, cadence, scale);
        let textures = this._CreateTextures(images);
        return new Sun(textures);
    }

    /**
     * Uses 3js to create textures out of image data
     * @private
     *
     * @param {HeliosImage[]} Image data to create textures from
     * @returns {HeliosTexture[]} Texture data for models to use
     */
    _CreateTextures(images) {
        // TODO: iterate over images and use 3js to create texture
        //       data
        // Then return a list of objects with {date: Date, texture: Texture, observer_position: Coordinates}
    }
}

let factory = new ModelFactory();
export default factory;

