import React, { useState } from "react";
import css from "./common.css";
import CloseButton from "./components/close_button";
import { ModelInfo } from "../../../common/types";
import LayerControl from "./components/layer_control";
import DatasourcePicker from "./components/datasource_picker";
import TextButton from "../../components/button/TextButton";

type LayerControlsProps = {
    visible: boolean;
    onClose: () => void;
    Layers: ModelInfo[];
    RegisterTimeListener: (fn: (date: Date) => void) => number;
    UnregisterTimeListener: (number: number) => void;
    UpdateModelOpacity: (id: number, opacity: number) => void;
    RemoveModel: (id: number) => void;
    AddLayer: (sourceId: number) => void;
};

export default function LayerControls({
    visible,
    onClose,
    Layers,
    RegisterTimeListener,
    UnregisterTimeListener,
    UpdateModelOpacity,
    RemoveModel,
    AddLayer,
}: LayerControlsProps): React.JSX.Element {
    const visibilityClass = visible ? css.visible : css.invisible;
    let [source, setSource] = useState(8);
    return (
        <div
            tabIndex={-1}
            aria-hidden={visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={onClose} />
            <DatasourcePicker selected={source} setSelected={setSource} />
            <TextButton text="Add Layer" onClick={() => AddLayer(source)} />
            <hr style={{ width: "100%" }} />
            {Layers.length == 0 ? (
                <p>You have not added any data to the scene</p>
            ) : (
                <></>
            )}
            {Layers.map((layer) => (
                <LayerControl
                    key={layer.id}
                    Layer={layer}
                    RegisterTimeListener={RegisterTimeListener}
                    UnregisterTimeListener={UnregisterTimeListener}
                    UpdateModelOpacity={UpdateModelOpacity}
                    RemoveModel={RemoveModel}
                />
            ))}
        </div>
    );
}
