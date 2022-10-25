import Config from "../Configuration.js";
import Helioviewer from "../API/helioviewer.js";

/**
 * Interface for querying HEK events
 */
class EventDB {
    /**
     * @typedef {Object} HEKEvent
     */
    /**
     * Query HEK (via helioviewer) for event data
     * @param {Date} start
     * @param {Date} end
     * @return {HEKEvent[]}
     */
    async GetEvents(start, end) {
        let results = [];
        const query_time = new Date(start);
        while (query_time <= end) {
            let promise = Helioviewer.GetEvents(new Date(query_time));
            results.push(promise);
            query_time.setSeconds(query_time.getSeconds() + Config.event_cadence_s);
        }

        // Wait for all queries to complete and add them to the resulting array.
        for (let i = 0; i < results.length; i++) {
            results[i] = await results[i];
        }

        return this.MergeEvents(results);
    }

    /**
     * Collapses the 2D array of events into a single list of non-duplicate events
     * Events that span more than the query cadence may be duplicated in the results and can be removed.
     * Each query returns a list of events, so event_list is an array of the form: [event_list_at_timeA, event_list_at_timeB, etc].
     * This list must be merged so that we return one list of non-duplicate events
     * @param {HEKEvent[][]} event_lists List of list of events
     * @returns {HEKEvent[]}
     */
    MergeEvents(event_lists) {
        let final_events = [];
        // Set of events that have been processed for performance reasons.
        // Its more performant to search a mapping than a list.
        let known_events = new Set();
        for (const list of event_lists) {
            for (const hekevent of list) {
                // https://www.lmsal.com/hek/VOEvent_Spec.html claims kb_archivid is a unique ID for each event.
                // Use this as the mapping for known events.
                let is_event_known = known_events.has(hekevent.kb_archivid);
                // If the event is not known, add it to the final event list
                if (!is_event_known) {
                    final_events.push(hekevent);
                    known_events.add(hekevent.kb_archivid)
                }
            }
        }
        return final_events;
    }
}

let db = new EventDB();
export default db;

