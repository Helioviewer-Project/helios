import Scene from "../../Scene/scene.js";
import MagneticField from "./MagneticField.js";

/**
 * This class is intended to be used to load magnetic field data.
 */
class FieldLoader {
    /**
     * Register the field loader as an asset handler
     * @constructor
     */
    constructor(scene) {
        scene.RegisterAssetLoader(this.AddTimeSeries.bind(this));
    }

    /**
     * Load magnetic field data using the given parameters.
     * @param {date} start Start time of data to add
     * @param {date} end   End time of data to add
     * @param {cadence} Amount of time to skip between data points
     * @param {Scene} scene scene instance (not threejs scene)
     */
    async AddTimeSeries(start, end, cadence, scene) {
        let result = await fetch("/resources/models/test_pfss.json");
        let data = await result.json();
        return this._RenderData(data, scene);
    }

    /**
     * Render field data to the scene
     * @param {Object} data Magnetic field data
     * @param {Scene} scene Threejs scene
     */
    _RenderData(data, scene) {
        let field_instance = new MagneticField(data);
        scene.AddAsset(field_instance);
    }
}

export {FieldLoader}