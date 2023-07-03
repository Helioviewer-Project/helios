import React, { useEffect, useState } from "react";
import { ModelInfo } from "../../../../common/types";
import { GetSourceName } from "../../../../common/sources";
import { ToDateString } from "../../../../common/dates";
import css from "./layer_control.css";
import TextButton from "../../../components/button/TextButton";

type LayerProps = {
    Layer: ModelInfo;
    RegisterTimeListener: (fn: (date: Date) => void) => number;
    UnregisterTimeListener: (number: number) => void;
    UpdateModelOpacity: (id: number, opacity: number) => void;
    RemoveModel: (id: number) => void;
};

/**
 * Represents controls for an individual layer control
 */
export default function LayerControl({
    Layer,
    RegisterTimeListener,
    UnregisterTimeListener,
    UpdateModelOpacity,
    RemoveModel,
}: LayerProps): React.JSX.Element {
    let [listenerId, setListenerId] = useState(null);
    let [modelTime, setModelTime] = useState(new Date());
    let [opacity, setOpacity] = useState(1);
    // Register this event listener so that the model time is updated whenever the scene changes
    useEffect(() => {
        let id = RegisterTimeListener((date) => {
            setModelTime(date);
        });
        setListenerId(id);
    }, []);

    function onOpacityChanged(e) {
        let newOpacity = parseFloat(e.target.value);
        setOpacity(newOpacity);
        UpdateModelOpacity(Layer.id, newOpacity);
    }

    function onRemove() {
        UnregisterTimeListener(listenerId);
        RemoveModel(Layer.id);
    }

    return (
        <div className={css.container}>
            <div className={css.header} tabIndex={-1}>
                <p>{GetSourceName(Layer.source)}</p>
                <p>{ToDateString(modelTime)}</p>
            </div>
            <div className={css.opacity_block}>
                <label style={{ paddingTop: "1px" }}>Opacity:</label>
                <input
                    style={{ marginBottom: 0 }}
                    onChange={onOpacityChanged}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={opacity}
                />
            </div>
            <TextButton onClick={onRemove} text="Remove" />
            <hr />
        </div>
    );
}
