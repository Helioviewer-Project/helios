import Model from "../Scene/model";

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

export { ModelInfo, SceneLayer };
