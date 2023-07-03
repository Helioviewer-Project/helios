import Config from "../Configuration.js";

/**
 * This module manages the controls for feature markers being rendered on the hemisphere.
 */
class Features {
    constructor() {
        /**
         * Stores all the events in a format that can be rendered in HTML
         * In order to keep the UI updated, events are stored with a "count"
         * The count represents how many times this event has been added to the feature list.
         * For example, we may get events at time T and time T + 1, so the events will be added to the feature list 2 times.
         * If time T is removed from the scene, then the event should still be displayed, since T + 1 is still being rendered.
         * If time T + 1 is removed from the scene as well, then the event will be removed from the list since its count has reached 0.
         */
        this._events = {};
    }

    /**
     * Adds a list of events to feature list
     */
    AddEvents(event_list) {}

    /**
     * Adds a single event to the feature list
     */
    AddEvent(e) {}

    /**
     * Removes a set of events from the feature list
     */
    RemoveEvents(event_list) {}

    /**
     * Removes a single event to the feature list
     */
    RemoveEvent(e) {}

    /**
     * Renders events stored in this._events to HTML
     * @private
     */
    _render() {}
}
let features = new Features();
export default features;
