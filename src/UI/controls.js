import React, { useState } from 'react'
import DateRangePicker from './date_range_picker';
import DatasourcePicker from './datasource_picker';
import HelioviewerMovie from './helioviewer_movie';
import { GetImageScaleForResolution } from "../common/resolution_lookup.js";
import Config from "../Configuration.js";
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

function getDefaultDateRange() {
    let now = new Date();
    let yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    let cadence = 86400;
    return {
        start: yesterday,
        end: now,
        cadence: cadence
    };
}

export default function Controls({scene}) {
    _ExecuteMobileViewportPatch();
    const [closed, setClosed] = useState(true);
    const [source, setSource] = useState({value: 8, text: 'SDO AIA 94'});
    const [layers, setLayers] = useState([]);
    const [sceneTime, setSceneTime] = useState(null);
    const dateRange = getDefaultDateRange();

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
        console.log("Updating layer state: ", layers);
    }

    function removeLayer(id) {
        scene.RemoveFromScene(id);
        setLayers(layers.filter((layer) => layer.id != id));
    }

    let addSource = async () => {
        if (dateRange.start > dateRange.end) {
            alert('Start time must be before end time');
        } else {
            let image_scale = GetImageScaleForResolution(Config.default_texture_resolution, source.value);
            let layer = await scene.AddToScene(source.value, dateRange.start, dateRange.end, dateRange.cadence, image_scale, layers.length + 1);
            addLayer(layer);
        }
    }

    return [
        <button key="0" onClick={() => setClosed(!closed)} id="js-sidebar-toggle" className={`demo-sidebar-close sidebar-closed ${closed ? 'closed' : ''}`}></button>,
        <div key="1" id="js-sidebar" className={`helios-visible demo-sidebar sidebar-closed ${closed ? 'closed' : ''}`}>
            <TimeDisplay time={sceneTime} onTimeChange={time => scene.SetTime(time)} />
            <DateRangePicker currentRange={dateRange} />
            <DatasourcePicker selected={source.value} setSelected={setSource} />
            <button onClick={addSource} id="js-add-source">Add Source</button>

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