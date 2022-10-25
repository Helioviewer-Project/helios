import {CreateMarkerModel, CreateHemisphere} from "./three/model_builder.js";
import {LoadTexture} from "./three/texture_loader.js";
import {Vector3} from "three";
import Scene from "./scene.js";
import {deg2rad, rad2deg, ms2day} from "../common/math.js";

let _active_region = LoadTexture("resources/images/active_region.png");

/**
 * Encapsulates information about a feature/event marker
 */
class Marker {
    /**
     * Constructs a marker from the given event data
     * @param {Object} e Event data queried from the HEK. See https://www.lmsal.com/hek/VOEvent_Spec.html for fields
     */
    static fromEventData(e) {
        if (e.hasOwnProperty('hgs_x') && e.hasOwnProperty('hgs_y')) {
            var marker = new Marker(e.hgs_y, e.hgs_x, e);
            return marker
        } else {
            throw ["Event uses unsupported coordinates", e];
        }
    }

    /**
     * Creates a marker at the given latitude, longitude position relative to the given model.
     * @param {number} lat Heliographic Stonyhurst Latitude
     * @param {number} lon Heliographic Stonyhurst Longitude
     * @param {event} e Model data
     */
    constructor(lat, lon, e) {
        this._event = e;
        /**
         * Angular velocity for computing the marker's position over time
         * Unit is radians/day
         */
        this._angular_velocity = this._ComputeVelocity(lat);

        /**
         * Initial event observation time. Used for calculating position as time passes in the scene.
         * Event_StartTime is a required field in HEK, so I'm trusting it's always present.
         */
        this._t_start = new Date(e.event_starttime + "Z");

        /**
         * End of the event. If the scene time has passed this time, the marker must disappear
         */
        this._t_end = new Date(e.event_endtime + "Z");

        /**
         * Initial longitude.
         * The angular velocity defines how the longitude changes over time, so we need an initial position.
         */
        this._lon0 = lon;

        /**
         * Constant latitude.
         * Needs to be stored so we can continue to position the model along this latitude.
         */
        this._lat0 = lat;

        /**
         * Hemisphere model that must be pointed to the observer for accurate rendering
         */
        this._hemisphere = null;

        // Construct the 3js model here.
        this._model = this._ConstructModel();

        // When model is created, position it.
        let marker = this;
        this._model.then((model) => {
            marker._RegisterPositionUpdater();
        });

    }

    _RegisterPositionUpdater() {
        let marker = this;
        Scene.RegisterTimeUpdateListener(async (date) => {
            marker._SetPositionForDate(date);
        });
    }

    /**
     * Computes the angle of rotation at the given time.
     * @param {Date} time The time that we want to observe
     * @returns radians
     */
    _ComputeAngleChange(time) {
        // difference between scene time and observation time
        // Dates return the result in milliseconds.
        let dt_ms = (time - this._t_start);
        // Convert milliseconds to days since angular velocity is stored in radians per day.
        let dt_days = ms2day(dt_ms);
        // Angular velocity is defined as change in angle over time
        // Return the angle changed in dt.
        // NOTE: dt_days is a very small value and I'm not sure if javascript has the precision to handle it.
        // Theta = rads/day * days
        let angle = this._angular_velocity * dt_days;
        return angle;
    }

    /**
     * Sets the marker's position for a given date.
     */
    _SetPositionForDate(scene_time) {
        // Only position the object if the event occurs within the scene's point in time
        if ((scene_time > this._t_start) && (scene_time < this._t_end)) {
            // Get the angle that the marker should have moved at away from the initial position.
            let angle = this._ComputeAngleChange(scene_time);
            // Apply this angle to get the longitude for the new scene time.
            let longitude = this._lon0 + rad2deg(angle);
            this._model.then((model) => {
                this._PositionModel(model, longitude, this._lat0);
                this._Show();
            });
        } else {
            // The position is nonexistent, hide the marker
            this._Hide();
        }
    }

    /**
     * Hides the model
     */
    _Hide() {
        this._model.then((model) => {
            model.visible = false;
        });
    }

    /**
     * Shows the model
     */
    _Show() {
        this._model.then((model) => {
            model.visible = true;
        });
    }

    /**
     * Computes angular velocity via https://en.wikipedia.org/wiki/Solar_rotation
     * returns angular velocity in radians per day
     * @private
     */
    _ComputeVelocity(lat) {
        // A, B, and C are constants.
        let A = 14.713;
        let B = -2.396;
        let C = -1.787;
        // Sine of latitude is used in the equation in several places
        // Latitude is in degrees, so convert it to radians
        let sin = Math.sin(deg2rad(lat));
        // This is the equation given in the article
        let w = A + B*Math.pow(sin, 2) + C*Math.pow(sin, 4);
        // The result is in degrees per day, convert this to radians for use with
        return deg2rad(w);
    }

    /**
     * Constructs the model for the marker. Used here since constructors cannot be async
     * @param {function} registerUpdateFn Function that registers an update function to be called each frame
     * @private
     */
    async _ConstructModel() {
        let text = "";
        if (this._event.hasOwnProperty("hv_labels_formatted")) {
            let keys = Object.keys(this._event.hv_labels_formatted);
            if (keys.length > 0) {
                text = this._event.hv_labels_formatted[keys[0]];
            }
        }
        this._hemisphere = CreateHemisphere();
        let hemisphere = await this._hemisphere;
        // TODO: The hemisphere must face the event's observer for this to work.

        let marker_model = CreateMarkerModel(await _active_region, text);
        hemisphere.add(marker_model);
        return marker_model;
    }

    /**
     * Computes the position of the given latitude/longitude
     * @param {number} lon Longitude
     * @param {number} lat Latitude
     * @returns {Vector3}
     */
    _ComputePosition(lon, lat) {
        // Radius of the sun mesh is 25 units
        let r = 25;
        let lat_rad = lat * Math.PI / 180;
        let lon_rad = lon * Math.PI / 180;
        // Formulas for converting lat/lon/radius (i.e. Heliographic Stonyhurst) to
        // xyz coordinates are given in W. T. Thompson, 2006, Coordinate systems for solar image data,
        // In 3js, y is the vertical axis (north pole)
        let y = r * Math.sin(lat_rad);
        let x = r * Math.cos(lat_rad) * Math.sin(lon_rad);
        let z = r * Math.cos(lat_rad) * Math.cos(lon_rad);
        return new Vector3(x, y, z);
    }

    /**
     * Positions the marker model in the scene
     * @param {Mesh} model Marker model to position
     * @param {number} lat Heliographic Stonyhurst Latitude
     * @param {number} lon Heliographic Stonyhurst Longitude
     */
    async _PositionModel(model, lon, lat) {
        let position = this._ComputePosition(lon, lat);
        // Formulas for converting lat/lon/radius (i.e. Heliographic Stonyhurst) to
        // xyz coordinates are given in W. T. Thompson, 2006, Coordinate systems for solar image data,
        // In 3js, y is the vertical axis (north pole)
        model.position.x = position.x;
        model.position.y = position.y;
        model.position.z = position.z;

        // TODO: Make sure the marker is always facing the camera
    }

    /**
     * Returns the model attached to this marker.
     */
    async GetModel() {
        return this._hemisphere;
    }
}

export default Marker;
