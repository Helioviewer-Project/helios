import {
    BufferGeometry,
    LineBasicMaterial,
    Line,
    Vector3,
    CatmullRomCurve3,
    Group,
    Color,
} from "three";
import { FreeModel } from "../../Scene/three/model_builder";

/**
 * Creates a 3D Representation of a single group of magnetic field lines
 */
class MagneticFieldLineGroup {
    /**
     * Construct a magnetic field asset using the given data
     * @constructor
     * @param {Object} data Data for the magnetic field
     */
    constructor(data) {
        this._date = data.date;
        this._data = data;
        this._lines = this._ConstructLineVectors(this._data.lines);
        this._model = this._RenderLines(this._lines);
    }

    /**
     * Renders line data into threejs curves
     * @param {Array<Line>} line_vectors List of line vectors, each line vector is an array of Vector3's
     */
    _RenderLines(line_vectors) {
        let group = new Group();
        for (const line of line_vectors) {
            group.add(this._RenderLineCurve(line));
        }
        group.renderOrder = 10000;
        return group;
    }

    /**
     * Renders an individual line using threejs CatmullRomCurve3
     * @param {Line} line Line data that has been processed into vector3's
     */
    _RenderLineCurve(line) {
        const curve = new CatmullRomCurve3(line.line);
        const points = curve.getPoints(50);
        const geometry = new BufferGeometry().setFromPoints(points);
        const material = new LineBasicMaterial({
            color: line.color,
            transparent: true,
        });
        const curveObject = new Line(geometry, material);
        return curveObject;
    }

    /**
     * @typedef {Object} Line
     * @property {Array<Vector3>} line Line data
     * @property {Color} color color of the line
     */
    /**
     * Converts each line in the data into a list of vectors
     * @param {Object} lines PFSS line data
     * @returns {Line}
     */
    _ConstructLineVectors(lines) {
        let line_vectors = [];
        // Temporary workaround, we should make the lines an array, not a 1-indexed object
        for (const line of lines) {
            line_vectors.push({
                line: this._ConstructLineVector(line),
                color: this._GetColor(line.polarity),
            });
        }
        return line_vectors;
    }

    /**
     * Gets the color of the line based on its polarity
     */
    _GetColor(polarity) {
        let colortable = {
            0: new Color("white"),
            "-1": new Color("blue"),
            1: new Color("red"),
        };
        return colortable[polarity];
    }

    /**
     * Parses individual line data into threejs vectors
     * @param {Object} line Individual PFSS line data
     */
    _ConstructLineVector(line) {
        let vector_list = [];
        let length = line.x.length;
        for (let idx = 0; idx < length; idx++) {
            vector_list.push(
                new Vector3(line.y[idx], line.z[idx], line.x[idx])
            );
        }
        return vector_list;
    }

    /**
     * Returns the threejs model to be rendered in the scene
     */
    GetRenderableModel() {
        return this._model;
    }

    SetTime(date) {}

    SetOpacity(opacity) {
        this._model.children.forEach((line) => {
            line.material.opacity = opacity;
        });
    }

    dispose() {
        FreeModel(this._model);
    }
}

export default MagneticFieldLineGroup;
