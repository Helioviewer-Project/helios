// import './UI/source_controls.js';
// import './UI/camera_controls.js';
// import './UI/animation_controls.js';
// import './UI/scene_time.js';
// import './UI/helioviewer_movie.js';
import Controls from './UI/controls.js';
import Scene from './Scene/scene';
// import './UI/video_manager.js';
import { createRoot } from 'react-dom/client';
import React from 'react';
import NavControls from './UI/navigation/controls';
import { GetImageScaleForResolution } from './common/resolution_lookup.js';
import config from './Configuration.js';
// import HTML from './common/html.js';

// /**
//  * When the page first loads, users should see something besides black, so load the first available image
//  */
// function LoadDefaultImage() {
//     // All the input fields are set to default values, so we can just click the "Load Image" button
//     HTML.add_source_btn.click();
// }

// LoadDefaultImage();



// Defined in main HTML, not React
const scene = new Scene('js-helios-viewport');

/**
 * Add
 */
let addSourceLayer = async (source, dateRange) => {
    if (dateRange.start > dateRange.end) {
        alert('Start time must be before end time');
    } else {
        let image_scale = GetImageScaleForResolution(config.default_texture_resolution, source.value);
        let layer = await scene.AddToScene(source.value, dateRange.start, dateRange.end, dateRange.cadence, image_scale, 1);
        console.log("TODO: Need to add the new layer to the UI")
    }
}

function App() {
    return (
        <div>
            <NavControls
                onAddData={addSourceLayer} />
            <Controls scene={scene} />
        </div>
    )
}

let root = createRoot(document.getElementById('app'));
root.render(<App />)