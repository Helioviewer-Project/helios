import Scene from "../../Scene/scene.js";
import MagneticField from "./MagneticField.js";
import config from "../../Configuration.js";

/**
 * This class is intended to be used to load magnetic field data.
 */
class FieldLoader {
    /**
     * Register the field loader as an asset handler
     * @constructor
     */
    constructor(scene) {}

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
        this._AddAsset(scene, field_instance);
    }

    _AddAsset(scene, instance) {
        scene.AddAsset(instance, async (scene, asset) => {
            // For reference, asset === instance
            let sun_model = scene.GetSourceWithEarthPerspective();
            let three_model = await sun_model.GetModel();
            let asset_model = asset.GetRenderableModel();
            asset_model.scale.set(25, 25, 25);
            three_model.add(asset_model);
        });
    }

    GetAssociatedSources() {
        return config.earth_sources;
    }
}

export { FieldLoader };
