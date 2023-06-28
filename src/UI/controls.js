import React, { useState } from 'react'
import HelioviewerMovie from './helioviewer_movie';
import AnimationControls from './animation_controls';
import LayerControls from "./layer_controls.js";
import TimeDisplay from './time_display';


/**
 * Manages the sidebar with all the controls
 */

function _ExecuteMobileViewportPatch() {
    // CSS trick to fix 100vh on mobile. Without this, 100vh goes below the viewport due to silly mobile browser implementations
    // See https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

export default function Controls({scene}) {
    _ExecuteMobileViewportPatch();
    const [closed, setClosed] = useState(true);
    const [source, setSource] = useState({value: 8, text: 'SDO AIA 94'});
    const [layers, setLayers] = useState([]);
    const [sceneTime, setSceneTime] = useState(null);

    // Make sure this is only ever called once.
    if (sceneTime == null) {
        scene.RegisterTimeUpdateListener((newTime) => {
            setSceneTime(newTime);
        })
    }

    function addLayer(layer) {
        let newLayers = [...layers];
        newLayers.push(layer);
        setLayers(newLayers);
    }

    function removeLayer(id) {
        scene.RemoveFromScene(id);
        setLayers(layers.filter((layer) => layer.id != id));
    }

    return [
        <button key="0" onClick={() => setClosed(!closed)} id="js-sidebar-toggle" className={`control-tab demo-sidebar-close ${closed ? 'closed' : ''}`}>
            Controls
        </button>,
        <div key="1" id="js-sidebar" className={`helios-visible demo-sidebar ${closed ? 'closed' : ''}`}>
            <TimeDisplay time={sceneTime} onTimeChange={time => scene.SetTime(time)} />

            <HelioviewerMovie scene={scene} numLayers={layers.length} addLayer={addLayer} />
            <AnimationControls scene={scene} />

            <LayerControls scene={scene} layers={layers} removeLayer={removeLayer} />

            <div id="current-events" className="hidden">
                <h1>Events:</h1>
                <div id="js-events" className="event-section">
                </div>
            </div>
        </div>
    ];``
}