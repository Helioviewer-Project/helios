import { Object3D } from "three";
import Coordinates from "./coordinates";

/**
 * A model represents generic 3D model information that can be rendered.
 * The model must define certain functions in order to be supported by the Scene.
 *
 */
interface Model {
    /**
     * The current time being rendered by the model.
     * This may be different than the scene time.
     */
    current_time: Date;

    /**
     * Optionally get the threejs model to render in the scene.
     * If an object is returned, it will be added to the scene.
     * For more advanced models, this may return null, and the rendering can be done within the model code.
     * @returns Model object or null
     */
    GetModel: () => Object3D | null;

    /**
     * Executed when the scene time is updated. The model should update itself to represent the given time.
     * Typically this is done during animation, so it should be fast, don't perform any long running tasks here (i.e. API requests).
     * @param date New scene time.
     */
    SetTime: (date: Date) => void;

    /**
     * Sets the model's layer order. If sharing space with other models,
     * the layer order determines which should be on top.
     * Higher numbers should be rendered on top of lower numbers.
     * @param number Layer order / "Z index"
     */
    SetLayerOrder: (number) => void;

    /**
     * This should return the number of "frames" / "time steps" associated with this data.
     * This is used by the animation engine to determine how many frames should displayed.
     * @returns
     */
    GetFrameCount: () => number;

    /**
     * Get the observer coordinate used for orienting this model.
     * The model will face this coordinate when rendered.
     * @returns x, y, z coordinate object
     */
    GetObserverPosition: () => Promise<Coordinates>;

    /**
     * The model should update its opacity based on the given value (0 to 1)
     * @param opacity The new opaqueness
     */
    SetOpacity: (opacity: number) => void;

    /**
     * Executed when the model is removed from the scene.
     * This should cleanup any used threejs resources.
     * If the rendering is self-managed, this should also remove the model from the scene.
     */
    dispose: () => void;
}

// See scene.js JSDoc reference for this type.
type ModelInfo = {
    id: number;
    source: number;
    startTime: Date;
    endTime: Date;
    order: number;
    cadence: number;
    scale: number;
    model: Model;
};

type SceneLayer = {
    source: number;
    start: Date | string;
    end: Date | string;
    cadence: number;
    scale: number;
};

/**
 * Represents a range of time that can be iterated over
 */
interface DateRange {
    /** Start of time range. */
    start: Date;
    /** End of time range. */
    end: Date;
    /** Number of seconds between each time step. */
    cadence: number;
}

export { Model, ModelInfo, SceneLayer, DateRange };
