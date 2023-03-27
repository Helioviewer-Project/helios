import './UI/source_controls.js';
import './UI/camera_controls.js';
import './UI/animation_controls.js';
import './UI/scene_time.js';
import './UI/helioviewer_movie.js';
import './UI/sidebar.js';
import HTML from './common/html.js';

/**
 * When the page first loads, users should see something besides black, so load the first available image
 */
function LoadDefaultImage() {
    // All the input fields are set to default values, so we can just click the "Load Image" button
    HTML.add_source_btn.click();
}

LoadDefaultImage();