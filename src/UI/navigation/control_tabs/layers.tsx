import React from "react";
import css from "./common.css"
import CloseButton from "./components/close_button";
import { ModelInfo } from "../../../common/types";
import LayerControl from "./components/layer_control";

type LayerControlsProps = {
    visible: boolean,
    onClose: () => void,
    Layers: ModelInfo[]
}

export default function LayerControls({
    visible,
    onClose,
    Layers
}: LayerControlsProps): React.JSX.Element {
    const visibilityClass = visible ? css.visible : css.invisible
    return <div tabIndex={-1} aria-hidden={visible ? "false" : "true"} className={`${css.tab} ${visibilityClass}`}>
        <CloseButton onClose={onClose} />
        {Layers.map(layer =>
            <LayerControl
                key={layer.id}
                layer={layer}/>)}
    </div>
}