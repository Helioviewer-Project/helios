import Config from '../Configuration.js';

/**
 * This module loads references to all of the UI elements that Helios uses so that document.getElementBy* doesn't need to be used repeatedly.
 * If anything is missing, add it here.
 */
class HTML {
    constructor() {
        console.log("Loading elements");
        this.start_time_input = document.getElementById(Config.start_picker_id);
        this.end_time_input = document.getElementById(Config.end_picker_id);
        this.num_frames_input = document.getElementById(Config.date_range_frames_id);
        this.source_selector = document.getElementById(Config.source_selector_id);
        this.resolution_selector = document.getElementById(Config.resolution_selector_id);
        this.animation_fps_input = document.getElementById(Config.animation_fps_id);
        this.animation_duration_input = document.getElementById(Config.animation_duration_id);
        this.play_btn = document.getElementById(Config.play_btn_id);
        this.pause_btn = document.getElementById(Config.pause_btn_id);
        this.viewport = document.getElementById(Config.viewport_id);
        this.add_source_btn = document.getElementById(Config.add_source_btn_id);
        this.scene_time_input = document.getElementById(Config.scene_time_input);
        this.hv_movie_input = document.getElementById(Config.helioviewer_movie_input_id);
        this.hv_movie_btn = document.getElementById(Config.helioviewer_movie_load_button);
        this.loader = document.getElementById(Config.loader_id);
        this.ui_sources = document.getElementById(Config.ui_sources_id);
    }
};

let instance = new HTML();
export default instance;