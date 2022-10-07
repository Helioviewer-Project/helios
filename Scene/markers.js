import {CreateMarkerModel} from "./three/model_builder.js";
import {LoadTexture} from "./three/texture_loader.js";
import {Vector3} from "three";

let _active_region = LoadTexture("resources/images/active_region.png");

/**
 * Encapsulates information about a feature/event marker
 */
class Marker {
    /**
     * Constructs a marker from the given event data
     * @param {Object} e Event data queried from the HEK
     */
    static fromEventData(e) {
        return new Marker(e.hgs_x, e.hgs_y);
    }

    /**
     * Creates a marker at the given latitude, longitude position relative to the given model.
     * @param {number} lat Heliographic Stonyhurst Latitude
     * @param {number} lon Heliographic Stonyhurst Longitude
     * @param {Model} model Solar model for positioning
     */
    constructor(lat, lon) {
        this._model = this._ConstructModel();

        // When model is created, position it.
        let marker = this;
        this._model.then((model) => { marker._PositionModel(model, lat, lon); });
    }

    /**
     * Constructs the model for the marker. Used here since constructors cannot be async
     * @param {function} registerUpdateFn Function that registers an update function to be called each frame
     * @private
     */
    async _ConstructModel() {
        let model = CreateMarkerModel(await _active_region);
        return model;
    }

    /**
     * Positions the marker model in the scene
     * @param {Mesh} model Marker model to position
     * @param {number} lat Heliographic Stonyhurst Latitude
     * @param {number} lon Heliographic Stonyhurst Longitude
     */
    async _PositionModel(model, lat, lon) {
        // Radius of the sun mesh is 25 units
        let r = 25;
        let lat_rad = lat * Math.PI / 180;
        let lon_rad = lon * Math.PI / 180;
        // Formulas for converting lat/lon/radius (i.e. Heliographic Stonyhurst) to
        // xyz coordinates are given in W. T. Thompson, 2006, Coordinate systems for solar image data,
        model.position.x = r * Math.sin(lat_rad);
        model.position.y = r * Math.cos(lat_rad) * Math.sin(lon_rad);
        model.position.z = r * Math.cos(lat_rad) * Math.cos(lon_rad);

        let target = new Vector3(
            (r + 1) * Math.sin(lat_rad),
            (r + 1) * Math.cos(lat_rad) * Math.sin(lon_rad),
            (r + 1) * Math.cos(lat_rad) * Math.cos(lon_rad)
        );
        model.lookAt(target);
    }

    /**
     * Returns the model attached to this marker.
     */
    async GetModel() {
        return await this._model;
    }
}

export default Marker;
