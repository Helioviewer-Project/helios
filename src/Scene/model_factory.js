import Database from "../Images/database.js";
import { GetSourceFromName } from "../common/sources";
import Model from "./model.js";
import { LoadTexture } from "./three/texture_loader.js";
import { FieldLoader } from "../Models/MagneticField/FieldLoaderGong.js";

/**
 * The model factory is used to build 3D models that can be added
 * to a 3js scene
 */
class ModelFactory {
    /**
     * Returns a Model for the given parameters.
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @param {Function} gpu_load_texture Function to initialize the texture on the GPU.
     * @param {Scene} scene Helios scene instance
     * @returns {Model} Model representing the sun, or null if no data is available
     */
    async CreateModel(
        source,
        start,
        end,
        cadence,
        scale,
        gpu_load_texture,
        scene
    ) {
        if (source < 100000) {
            return await this.CreateSolarModel(
                source,
                start,
                end,
                cadence,
                scale,
                gpu_load_texture
            );
        } else if (source === GetSourceFromName("PFSS (GONG)")) {
            return await this.CreatePFSSModel(start, end, cadence, scene);
        }
    }

    /**
     * Creates the model for PFSS lines
     * @param {Date} start
     * @param {Date} end
     * @param {number} cadence
     * @param {Scene} scene
     */
    async CreatePFSSModel(start, end, cadence, scene) {
        let loader = new FieldLoader();
        let model = await loader.AddTimeSeries(start, end, cadence, scene);
        return model;
    }

    /**
     * Returns a Solar Model for the given parameters. Or null if there are no images available
     * for the given time range
     *
     * @param {number} source Telescope source ID
     * @param {Date} start Beginning of time range to query
     * @param {Date} end End of time range to query
     * @param {number} cadence Number of seconds between each image
     * @param {number} scale Image scale that will be requested
     * @param {Function} gpu_load_texture Function to initialize the texture on the GPU.
     * @returns {Model} Model representing data to be rendered.
     */
    async CreateSolarModel(
        source,
        start,
        end,
        cadence,
        scale,
        gpu_load_texture
    ) {
        /*
        source = 13;
        start = new Date("2022-01-01");
        end = new Date("2022-02-01");
        cadence = 3600 * 24;
        scale = 8;
        */
        try {
            var images = await Database.GetImages(
                source,
                start,
                end,
                cadence,
                scale
            );
        } catch (e) {
            throw "Failed to create model: " + e;
        }
        // If there's no image data available, then return nothing
        // The should bubble up to the UI code which must alert the user
        // that their search returned nothing.

        let textures = await this._CreateTextures(images, gpu_load_texture);
        return new Model(textures, source);
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
     * @param {HeliosImage[]} Image data to create textures from
     * @param {Function} gpu_load_texture Function to initialize the texture on the GPU.
     * @returns {HeliosTexture[]} Texture data for models to use
     */
    async _CreateTextures(images, gpu_load_texture) {
        let result = [];
        // LoadTexture is async, so this first iteration
        // fires off the load texture requests
        for (const image of images) {
            let texture = LoadTexture(image.url);
            result.push({
                date: image.date,
                texture: texture,
                jp2info: image.jp2info,
                position: image.position,
            });
        }

        // Wait for async calls to complete.
        for (const image of result) {
            image.texture = await image.texture;
            if (gpu_load_texture) {
                gpu_load_texture(image.texture);
            }
        }
        return result;
    }
}

let factory = new ModelFactory();
export default factory;
