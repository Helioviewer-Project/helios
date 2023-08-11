import MagneticField from "./MagneticField.js";
import config from "../../Configuration.js";

import { ToAPIDate } from "../../common/dates.js";
import  {Helios} from "../../API/helios.js";
/**
 * This class is intended to be used to load magnetic field data.
 */
class FieldLoader {
    /**
     * Register the field loader as an asset handler
     * @constructor
     */
    constructor(scene) {
        this.field_instances = [];
    }

    //   *
    //  @param {date} start Start time of data to add
   
    //  * @param {date} end   End time of data to add
    //  * @param {cadence} Amount of time to skip between data points
    //  * @param {Scene} scene scene instance (not threejs scene)
    //  */
    async AddTimeSeries(start, end, cadence, scene) {
        let currentDate = new Date(start);
        let endDate = new Date(end)
        // let result1 = ToAPIDate(currentDate);
        let result1 = ToAPIDate(currentDate);
        let url = await Helios.get_field_lines_gong(currentDate);
        let resultFinal= await fetch(url);
        let data1 = await resultFinal.json();
        this._RenderData(data1, scene);
        while (currentDate <= endDate) {
            let date = currentDate
            let sec = date.getSeconds();
            date.setSeconds(sec + cadence);
            let result = ToAPIDate(date);
            let url = await Helios.get_field_lines_gong(result);
            currentDate = date;
            let resultFinal = await fetch(url);
            let data = await resultFinal.json();
            this._RenderData(data, scene);
        }
        let LineMa = new LineManager(this.field_instances, scene);

    }

    /**
     * Render field data to the scene
     * @param {Object} data Magnetic field data
     * @param {Scene} scene Threejs scene
     */
    _RenderData(data, scene) {
        let mag = new MagneticField(data.path);
        let field_instance = { "mag": mag, "data" : data}
        this.field_instances.push(field_instance);
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
        this.check = 0;
        scene.RegisterTimeUpdateListener(this.listener.bind(this)) //ask about this 
    }
    async listener(CurrDate){
        let chosen_index = 0;
        console.log(CurrDate)
        console.log(this.field_instances[0].data.date)
        let dt = Math.abs(CurrDate- this.field_instances[0].data.date);
        // To choose the nearest date, iterate over all dates and select
        // the one with the lowest time delta from the given date
        // Start at 1 since 0 was already set above.
        for (let i = 1; i < this.data.length; i++) {
            const stored_date = this.field_instances[i].data.date;
            let delta = Math.abs(date - stored_date);
            // If the time difference is smaller than the stored time difference,
            // then update to that date.
            if (delta < dt) {
                chosen_index = i;
                dt = delta;
            }
        }
        if (this.previousModel != 0 ) and (this.check != 0)
            this.lines[this.previousModel].GetRenderableModel().removeFromParent();
        this.field_instances[chosen_index].mag.GetRenderableModel();
        this._AddAsset(this.scene, this.lines[approximatedRotation]);
        this.previousModel = chosen_index;
        this.check = 1
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
