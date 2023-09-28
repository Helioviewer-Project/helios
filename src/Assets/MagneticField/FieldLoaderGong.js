import MagneticField from "./MagneticField.js";
import config from "../../Configuration.js";

import { Helios } from "../../API/helios";
import { Vector3 } from "three";
import { ToUTCDate } from "../../common/dates";

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

    /**
     * @param {date} start Start time of data to add
     * @param {date} end   End time of data to add
     * @param {cadence} Amount of time to skip between data points
     * @param {Scene} scene scene instance (not threejs scene)
     */
    async AddTimeSeries(start, end, cadence, scene) {
        let dates = [];
        let date = new Date(start);
        while (date <= end) {
            dates.push(new Date(date));
            date.setSeconds(date.getSeconds() + cadence);
        }
        let data = await Helios.get_field_lines_gong(dates);
        data.forEach((line_set) => this._RenderData(line_set));
        return new LineManager(this.field_instances, scene);
    }

    /**
     * Render field data to the scene
     * @param {Object} data Magnetic field data
     */
    _RenderData(data) {
        let mag = new MagneticField(data);
        let field_instance = { mag: mag, date: ToUTCDate(new Date(data.date)) };
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
        this.current_time = this.lines[0].date;
        this._current_asset = -1;
        this.SetTime(scene.GetTime());
    }

    /**
     * Returns the time difference between the given date and the magnetic field data at the given index
     * @param {Date} date
     * @param {number} index
     */
    get_dt(date, index) {
        return Math.abs(date - this.lines[index].date);
    }

    /**
     * Searches the data for the field line set closest to the given date
     * @param {Date} date
     * @return {number} index of the chosen line set
     */
    FindNearestLineData(date) {
        // Perform a binary-like search to find the target object
        // Start in the middle
        let chosen_index = Math.floor(this.lines.length / 2);
        let dt = this.get_dt(date, chosen_index);
        // We're searching for a dt nearest to 0.
        let left = 0;
        let right = this.lines.length - 1;
        while (left <= right) {
            // Check boundary conditions before continuing so we don't have an out of bounds error
            if (chosen_index == 0) {
                return 0;
            }
            if (chosen_index == this.lines.length - 1) {
                return this.lines.length - 1;
            }
            // Check the indices one below and one above to choose which direction to move.
            // The reason we don't search the middle of the two sections is that it's possible that both the left and right midpoints
            // have a higher dt than the current one we're looking at. But that doesn't guarantee that the current index is the correct target.
            // The reason is that the list is sorted by dates, not delta time. While the data is sorted by date, the delta time actually forms a V shape.
            // The farther to the left we go, the higher the dt, and the farther right, the higher the dt. As we get close to the target, the dt goes to 0.
            // So jumping too far left or right can cause us to miss the minimum dt.
            let left_dt = this.get_dt(date, chosen_index - 1);
            let right_dt = this.get_dt(date, chosen_index + 1);
            // The left side has the lower dt shift focus there.
            if (left_dt < dt) {
                right = chosen_index - 1;
            }
            // The right side has a lower dt, shift focus there.
            else if (right_dt < dt) {
                left = chosen_index + 1;
            }
            // The left and right are both higher. That means we've found the min.
            else {
                return chosen_index;
            }
            chosen_index = Math.floor((left + right) / 2);
            dt = this.get_dt(date, chosen_index);
        }
    }

    async SetTime(date) {
        let chosen_index = this.FindNearestLineData(date);
        this._AddAsset(this.scene, this.lines[chosen_index].mag);
        this.previousModel = this.lines[chosen_index].mag;
        this.current_time = this.lines[chosen_index].date;
    }

    SetLayerOrder() {}

    GetFrameCount() {
        return this.lines.length;
    }

    GetPosition() {
        return new Vector3(0, 0, 0);
    }

    async GetObserverPosition() {
        return await Helios.GetEarthPosition(this.current_time);
    }

    SetOpacity(opacity) {
        this.previousModel.SetOpacity(opacity);
    }

    _RemoveAsset() {
        if (this._current_asset != -1) {
            this.scene.DeleteAsset(this._current_asset);
        }
    }

    async _AddAsset(scene, instance) {
        this._RemoveAsset();
        this._current_asset = await scene.AddAsset(instance);
    }

    dispose() {
        this._RemoveAsset();
        for (const field of this.lines) {
            field.mag.dispose();
        }
    }
}
export { FieldLoader };
