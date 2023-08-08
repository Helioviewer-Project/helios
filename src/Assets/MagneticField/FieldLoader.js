import MagneticField from "./MagneticField.js";
import config from "../../Configuration.js";

import { ToAPIDate } from "../../common/dates";
import  {Helios} from "../../API/helios";
/**
 * This class is intended to be used to load magnetic field data.
 */
class FieldLoader {
    /**
     * Register the field loader as an asset handler
     * @constructor
     */
    constructor(scene) {
        this.field_instances = {};
    }

    /**
     * Load magnetic field data using the given parameters.
     * @param {date} start Start time of data to add
     * @param {date} end   End time of data to add
     * @param {cadence} Amount of time to skip between data points
     * @param {Scene} scene scene instance (not threejs scene)
     */
    async AddTimeSeries(start, end, cadence, scene) {
        let currentDate = new Date(start);

        let endDate = new Date(end)
        let result1 = ToAPIDate(currentDate);
        let url = await Helios.get_field_lines(result1);
        let resultFinal= await fetch(url);
        let data1= await resultFinal.json();
        let l = url.slice(-9);
        let number = parseInt(l);
        this._RenderData(data1, scene, number);
        while (currentDate <= endDate) {
            let date = currentDate
            let day = date.getDate();
            date.setDate(day + 27);
            let result = ToAPIDate(date);
            let url = await Helios.get_field_lines(result);
            currentDate = date;
            let resultFinal= await fetch(url);
            let data = await resultFinal.json();
            let l = url.slice(-9);
            let number = parseInt(l);
            this._RenderData(data, scene, number);
        }
        let LineMa = new LineManager(this.field_instances, scene);
        

    }

    /**
     * Render field data to the scene
     * @param {Object} data Magnetic field data
     * @param {Scene} scene Threejs scene
     */
    _RenderData(data, scene, number ) {
        let field_instance = new MagneticField(data);
        this.field_instances[number] = field_instance;
    }



    GetAssociatedSources() {
        return config.earth_sources;
    }
}
class LineManager{
    constructor(MagneticFieldInstances, scene) {
        this.scene = scene;
        this.lines = MagneticFieldInstances;
        this.previousModel = 0;
        scene.RegisterTimeUpdateListener(this.listener.bind(this)) //ask about this 
    }
    async listener(CurrDate){
        let utcDate = new Date(CurrDate);
        let millisecondsSinceReference = utcDate - new Date('1853-11-09T16:00:00Z');
        let carringtonRotations = millisecondsSinceReference / (27.2753 * 24 * 60 * 60 * 1000);
        let approximatedRotation = Math.round(carringtonRotations);
        if (this.previousModel != 0)
            this.lines[this.previousModel].GetRenderableModel().removeFromParent();
        this.lines[approximatedRotation].GetRenderableModel();
        this._AddAsset(this.scene, this.lines[approximatedRotation]);
        this.previousModel = approximatedRotation;
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
}
export { FieldLoader };
