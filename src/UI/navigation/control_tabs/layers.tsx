import React from "react";
import css from "./common.css"
import CloseButton from "./components/close_button";
import { ModelInfo } from "../../../common/types";
import LayerControl from "./components/layer_control";

type LayerControlsProps = {
    visible: boolean,
    onClose: () => void,
    Layers: ModelInfo[],
    RegisterTimeListener: (fn: (date: Date) => void) => number,
    UnregisterTimeListener: (number: number) => void,
    UpdateModelOpacity: (id: number, opacity: number) => void,
    RemoveModel: (id: number) => void
}

export default function LayerControls({
    visible,
    onClose,
    Layers,
    RegisterTimeListener,
    UnregisterTimeListener,
    UpdateModelOpacity,
    RemoveModel
}: LayerControlsProps): React.JSX.Element {
    const visibilityClass = visible ? css.visible : css.invisible
    return <div tabIndex={-1} aria-hidden={visible ? "false" : "true"} className={`${css.tab} ${visibilityClass}`}>
        <CloseButton onClose={onClose} />
        {Layers.length == 0 ? <p>You have not added any data to the scene</p> : <></>}
        {Layers.map(layer =>
            <LayerControl
                key={layer.id}
                Layer={layer}
                RegisterTimeListener={RegisterTimeListener}
                UnregisterTimeListener={UnregisterTimeListener}
                UpdateModelOpacity={UpdateModelOpacity}
                RemoveModel={RemoveModel}/>)}
    </div>
}