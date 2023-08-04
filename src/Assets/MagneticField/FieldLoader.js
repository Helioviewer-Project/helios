import Scene from "../../Scene/scene.js";
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
        this.field_instances = [];
    }

    /**
     * Load magnetic field data using the given parameters.
     * @param {date} start Start time of data to add
     * @param {date} end   End time of data to add
     * @param {cadence} Amount of time to skip between data points
     * @param {Scene} scene scene instance (not threejs scene)
     */
    async AddTimeSeries(start, end, cadence, scene) {
        //list of car rot,every 27 days apart,
        //url
        //for each date 
        let currentDate = new Date(start);

        let endDate = new Date(end)
        let result1 = ToAPIDate(currentDate);
        let url = await Helios.get_field_lines(result1);
        let resultFinal= await fetch(url);
        let data1= await resultFinal.json();
        this._RenderData(data1, scene);
        while (currentDate <= endDate) {
            // Convert the string to a Date object
            let date = currentDate
            // Get the day of the month
            let day = date.getDate();
            // Add 27 days to the current day
            date.setDate(day + 27);
            let result = ToAPIDate(date);
            // console.log(result);
            let url = await Helios.get_field_lines(result);
            // console.log(url)
            currentDate = date;
            let resultFinal= await fetch(url);
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
class LineManager{
    constructor(MagneticFieldInstances, scene) {
        this.scene = scene;
        this.lines = MagneticFieldInstances;
        scene.RegisterTimeUpdateListener(this.listener.bind(this)) //ask about this 
    }
    async listener(CurrDate){
        let result = ToAPIDate(CurrDate);
        let right_url = await Helios.get_field_lines(result);
        for (let i = 0; i < this.lines.length; i++) {
            let date = this.lines[i]['_data']['fieldlines']['frame']['source_map_obstime']['value'];
            let url = await Helios.get_field_lines(date);
            console.log(right_url);
            console.log(url);
            if (right_url === url){
                console.log("sameeeeeeeee");
                this.scene.AddAsset(this.lines[i]);
            }
        }
    }
}
export { FieldLoader };
