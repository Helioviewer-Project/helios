import EventDB from "../Events/event_db.js";
import Scene from "../Scene/scene.js";
import Marker from "../Scene/markers.js";

/**
 * The Event Manager manages all events being rendered in the scene.
 * You can think of the event manager as the Event version of Scene.
 * The Scene controls all solar images being displayed, and the event manager manages
 * all events being displayed.
 * Therefore the interface for them should be relatively similar.
 * The EventManager is a submodule of the Scene. So even though they are similar,
 * it's the scene that is driving the events. And the User is driving the scene.
 */
class EventManager {
    constructor() {
        /**
         * The list of event data currently being managed
         */
        this._current_events = [];

        /**
         * Event models currently being rendered
         */
        this._event_markers = [];

        /**
         * The current scene time range
         */
        this._time_range = [];
    }

    /**
     * Sets the time range of events that should be rendered.
     * TODO: Events are currently additive, there should be a way to remove unused events from the scene.
     */
    SetTimeRange(range) {
        // First query, this sets the initial time range
        if (this._time_range.length == 0) {
            this._time_range = range;
            this.AddEvents(range[0], range[1]);
        } else {
            // Otherwise, only deal with new data.
            let start = this._time_range[0];
            if (range[0] < start) {
                // Start time has extended earlier, add this new range to the scene.
                this.AddEvents(range[0], this._time_range[0]);
            }

            let end = this._time_range[1];
            if (range[1] > end) {
                // End time has extended later, add this new range to the scene.
                this.AddEvents(this._time_range[1], range[1]);
            }
        }
    }

    /**
     * Adds events within the given time range to the scene
     * @param {Date} start Start time
     * @param {Date} end End time
     */
    async AddEvents(start, end) {
        let events = await EventDB.GetEvents(start, end);
        // Uncomment this to only render sunspots (or an event type of your choosing)
        // let events = events.filter((e) => e.concept == "Sunspot");
        for (const event of events) {
            // Resolve the coordinates promise before passing data to the marker.
            event.coordinates = await event.coordinates;
            let marker = Marker.fromEventData(event);
            marker.GetModel().then((model) => Scene.AddModel(model));
        }
        //console.log(sunspots[13]);

        // let marker = new Marker(29.477, -16.133, sunspots[13]);
        //Scene.AddModel(await marker.GetModel());
    }
}
let em = new EventManager();
export default em;
