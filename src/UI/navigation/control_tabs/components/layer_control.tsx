import React, { useEffect, useState } from "react";
import { ModelInfo } from "../../../../common/types";
import { GetSourceName } from "../../../../common/sources";
import { ToDateString } from "../../../../common/dates";
import css from "./layer_control.css"

type LayerProps = {
    Layer: ModelInfo,
    RegisterTimeListener: (fn: (Date) => void) => void,
    UpdateModelOpacity: (id: number, opacity: number) => void
}

/**
 * Represents controls for an individual layer control
 */
export default function LayerControl({
    Layer,
    RegisterTimeListener,
    UpdateModelOpacity
}: LayerProps): React.JSX.Element {
    let [modelTime, setModelTime] = useState(new Date())
    let [opacity, setOpacity] = useState(1)
    // Register this event listener so that the model time is updated whenever the scene changes
    useEffect(() => {
        RegisterTimeListener((date) => {
            setModelTime(date)
        })
    }, []);

    function onOpacityChanged(e) {
        let newOpacity = parseFloat(e.target.value)
        setOpacity(newOpacity);
        UpdateModelOpacity(Layer.id, newOpacity);
    }

    return <div className={css.container}>
        <div className={css.header} tabIndex={-1}>
            <p>{GetSourceName(Layer.source)}</p>
            <p>{ToDateString(modelTime)}</p>
        </div>
        <div>
            <label>Opacity:</label>
            <input onChange={onOpacityChanged} type="range" min="0" max="1" step="0.01" value={opacity} />
        </div>
    </div>
}