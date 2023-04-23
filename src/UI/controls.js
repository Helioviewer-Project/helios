import React, { useState } from 'react'
import DateRangePicker from './date_range_picker';
import DatasourcePicker from './datasource_picker';
import HelioviewerMovie from './helioviewer_movie';
import { GetImageScaleForResolution } from "../common/resolution_lookup.js";
import Config from "../Configuration.js";
import AnimationControls from './animation_controls';

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
    const dateRange = getDefaultDateRange();

    function addLayer(layer) {
        let newLayers = layers;
        newLayers.push(layer);
        setLayers(newLayers);
    }

    function addSource() {
        if (dateRange.start > dateRange.end) {
            alert('Start time must be before end time');
        } else {
            let image_scale = GetImageScaleForResolution(Config.default_texture_resolution, source.value);
            let promise = scene.AddToScene(source.value, dateRange.start, dateRange.end, dateRange.cadence, image_scale, layers.length + 1);
            // TODO: Draw controls
        }
    }

    return [
        <button key="0" onClick={() => setClosed(!closed)} id="js-sidebar-toggle" className={`demo-sidebar-close sidebar-closed ${closed ? 'closed' : ''}`}></button>,
        <div key="1" id="js-sidebar" className={`helios-visible demo-sidebar sidebar-closed ${closed ? 'closed' : ''}`}>
            <DateRangePicker currentRange={dateRange} />
            <DatasourcePicker selected={source.value} setSelected={setSource} />
            <button onClick={addSource} id="js-add-source">Add Source</button>

            <HelioviewerMovie scene={scene} numLayers={layers.length} addLayer={addLayer} />
            <AnimationControls scene={scene} />

            <div id="current-sources" className="hidden">
                <h1>Display:</h1>
                <div className="template data-source">
                    <p className="source-label"></p>
                    <p className="source-time">2022-08-11 00:00:00</p>
                    <p className="source-camera">
                        <label>Lock on: </label>
                        <input className="source-camera-lock" type="checkbox"/>
                    </p>
                    <div className="source-opacity-block">
                        <label>Opacity:</label>
                        <input className="source-opacity" type="range" min="0" max="1" step="0.01" defaultValue="1"/>
                    </div>
                    <button type="button" className="source-remove">Remove</button>
                </div>
            </div>

            <div id="current-events" className="hidden">
                <h1>Events:</h1>
                <div id="js-events" className="event-section">
                </div>
            </div>
        </div>
    ];``
}