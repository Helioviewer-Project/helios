import {CreateMarkerModel} from "./three/model_builder.js";
import {LoadTexture} from "./three/texture_loader.js";

let _active_region = LoadTexture("resources/images/active_region.png");

/**
 * Encapsulates information about a feature/event marker
 */
class Marker {
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
        model.position.z = r * Math.cos(lat_rad) * Math.cos(lon_rad);
        model.position.y = r * Math.cos(lat_rad) * Math.sin(lon_rad);
        model.position.x = r * Math.sin(lat_rad);
    }

    /**
     * Returns the model attached to this marker.
     */
    async GetModel() {
        return await this._model;
    }
}

export default Marker;
