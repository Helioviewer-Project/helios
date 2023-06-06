import React, { useState } from 'react';

export default function LayerControls({scene, layers, removeLayer}) {
    const [lock, setLock] = useState(null);
    function LockTo(id) {
        setLock(id);
        if (id != null) {
            scene.LockCamera(id);
        } else {
            scene.UnlockCamera();
        }
    }
    console.log("Calling LayerControls: ", layers);
    return (
        <div>
            {layers.length > 0 ? <h1>Display: </h1> : ""}
            {layers.map((layer) => <Layer key={layer.id} scene={scene} layer={layer} locked={lock == layer.id} lockOn={LockTo} removeLayer={removeLayer} />)}
        </div>
    )
}

function Layer({scene, layer, locked, lockOn, removeLayer}) {
    console.log("Rendering layer", layer);
    return (
        <div className="data-source">
            <p className="source-label"></p>
            <p className="source-time">{layer.model.current_time.toISOString()}</p>
            <p className="source-camera">
                <label>Lock on: </label>
                <input onChange={(e) => e.target.checked ? lockOn(layer.id) : lockOn(null)} checked={locked} className="source-camera-lock" type="checkbox"/>
            </p>
            <div className="source-opacity-block">
                <label>Opacity:</label>
                <input onChange={(e) => scene.SetModelOpacity(layer.id, e.target.value)} className="source-opacity" type="range" min="0" max="1" step="0.01" defaultValue="1"/>
            </div>
            <button onClick={(e) => removeLayer(layer.id)} type="button" className="source-remove">Remove</button>
        </div>
    );
}