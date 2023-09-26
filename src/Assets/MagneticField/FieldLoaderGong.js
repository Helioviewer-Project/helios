import MagneticField from "./MagneticField.js";
import config from "../../Configuration.js";

import { Helios } from "../../API/helios";
/**
 * This class is intended to be used to load magnetic field data.
 */
class FieldLoader {
    /**
     * Register the field loader as an asset handler
     * @constructor
     */
    constructor() {
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
        let endDate = new Date(end);
        let url = await Helios.get_field_lines_gong(currentDate);
        let resultFinal = await fetch(url.path);
        let data1 = await resultFinal.json();
        this._RenderData(data1, scene);
        while (currentDate <= endDate) {
            let date = currentDate;
            let sec = date.getSeconds();
            date.setSeconds(sec + cadence);
            let url = await Helios.get_field_lines_gong(date);
            currentDate = date;
            let resultFinal = await fetch(url.path);
            let data = await resultFinal.json();
            this._RenderData(data, scene);
        }
        new LineManager(this.field_instances, scene);
    }

    /**
     * Render field data to the scene
     * @param {Object} data Magnetic field data
     */
    _RenderData(data) {
        let mag = new MagneticField(data);
        let field_instance = { mag: mag, data: data };
        this.field_instances.push(field_instance);
    }

    GetAssociatedSources() {
        return config.earth_sources;
    }
}
class LineManager {
    constructor(MagneticFieldInstances, scene) {
        this.scene = scene;
        this.lines = MagneticFieldInstances;
        this.previousModel = 0;
        scene.RegisterTimeUpdateListener(this.listener.bind(this)); //ask about this
    }
    async listener(date) {
        let chosen_index = 0;
        let dt = Math.abs(date - this.lines[0].data.date);
        // To choose the nearest date, iterate over all dates and select
        // the one with the lowest time delta from the given date
        // Start at 1 since 0 was already set above.
        for (let i = 1; i < this.lines.length; i++) {
            const stored_date = this.lines[i].data.date;
            let delta = Math.abs(date - stored_date);
            // If the time difference is smaller than the stored time difference,
            // then update to that date.
            if (delta < dt) {
                chosen_index = i;
                dt = delta;
            }
        }
        if (this.previousModel != 0) {
            this.previousModel.removeFromParent();
        }
        this.lines[chosen_index].mag.GetRenderableModel();
        this._AddAsset(this.scene, this.lines[chosen_index].mag);
        this.previousModel = this.lines[chosen_index].mag;
    }

    _AddAsset(scene, instance) {
        scene.AddAsset(instance);
    }
}
export { FieldLoader };
