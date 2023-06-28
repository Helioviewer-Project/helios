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
window.scene = new Scene('js-helios-viewport');

function App() {
    return (
        <div>
            <NavControls />
            <Controls scene={window.scene} />
        </div>
    )
}

let root = createRoot(document.getElementById('app'));
root.render(<App />)