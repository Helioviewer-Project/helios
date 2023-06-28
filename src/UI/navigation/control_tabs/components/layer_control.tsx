import React from "react";
import { ModelInfo } from "../../../../common/types";
import { GetSourceName } from "../../../../common/sources";

type LayerProps = {
    layer: ModelInfo
}

export default function LayerControl({
    layer
}: LayerProps): React.JSX.Element {
    return <div tabIndex={-1}>
        <h1>{GetSourceName(layer.source)}</h1>
    </div>
}