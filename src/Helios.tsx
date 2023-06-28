import Scene from './Scene/scene';
import { createRoot } from 'react-dom/client';
import React, { useState } from 'react';
import NavControls from './UI/navigation/controls';
import { GetImageScaleForResolution } from './common/resolution_lookup.js';
import config from './Configuration.js';
import TimeDisplay from './UI/time_display.js';

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
    const [sceneTime, setSceneTime] = useState(null);
    // Make sure this is only ever called once.
    if (sceneTime == null) {
        scene.RegisterTimeUpdateListener((newTime) => {
            setSceneTime(newTime);
        })
    }
    return (
        <div>
            <TimeDisplay time={sceneTime} onTimeChange={time => scene.SetTime(time)} />
            <NavControls
                onAddData={addSourceLayer}
                GetSceneTime={() => scene.GetTime()}
                GetSceneTimeRange={() => scene.GetTimeRange()}
                GetMaxFrameCount={() => scene.GetMaxFrameCount()}
                SetSceneTime={(date) => scene.SetTime(date)}/>
        </div>
    )
}

let root = createRoot(document.getElementById('app'));
root.render(<App />)