import Scene from "../Scene/scene.js";
import SourceManager from "./source_controls.js";
import ResolutionPicker from "./resolution_picker.js";

/**
 * The Video Manager manages saving and loading videos created on Helios.
 */
class VideoManager {
    constructor() {}

    /**
     * Saves the current layers in the viewport to a video
     */
    save() {
        // Get current layers from the source manager and place them into an object
        let video = Scene.GetLayers();
        // Save the object to local storage
        this._save_video(video);
        // Save the object to the server
        this._save_video_remote(video);
    }

    /**
     * Loads a video into the viewport
     * @param {SceneLayer[]} video The video object to load
     */
    load(video) {
        // Remove everything from the scene
        SourceManager.RemoveAllSources();
        // Add the layers from the video to the scene
        for (const layer of video) {
            SourceManager.AddSourceWithParams(
                new Date(layer.start),
                new Date(layer.end),
                layer.cadence,
                layer.source,
                ResolutionPicker.GetResolution()
            );
        }
    }

    /**
     * Saves a video to local storage
     * @param {SceneLayer[]} video
     */
    _save_video(video) {
        // Get videos from local storage
        let videos = JSON.parse(localStorage.getItem("videos"));
        if (videos == null) {
            videos = [];
        }
        // Append the new video
        videos.push(video);
        // Save the videos back to local storage
        localStorage.setItem("videos", JSON.stringify(videos));
    }

    _save_video_remote(video) {
        // TODO: Implement server to save video to.
    }
}
let manager = new VideoManager();
export default manager;
