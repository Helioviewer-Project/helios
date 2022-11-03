import Config from "../Configuration.js";
import Helioviewer from "../API/helioviewer.js";

/**
 * Interface for querying HEK events
 */
class EventDB {

    /**
     * Takes a date range and returns an array of dates corresponding to one day per date.
     * For example given 2022-10-01 12:00:00 and 2022-10-04 12:00:00
     * The result will be [2022-10-01, 2022-10-02, 2022-10-03, 2022-10-04]
     * @param {Date} start
     * @param {Date} end
     * @return {Date[]}
     * @private
     */
    _DateRangeToIndividualDays(start, end) {
        // Change start and end to days, ignoring hours.
        start = new Date(`${start.getUTCFullYear()}-${start.getUTCMonth() + 1}-${start.getUTCDate()} 00:00:00Z`);
        end = new Date(`${end.getUTCFullYear()}-${end.getUTCMonth() + 1}-${end.getUTCDate()} 00:00:00Z`);
        // Now that start and end are reduced to days, get the number of days between them.
        // 86400*1000 is milliseconds per day. Subtracting dates returns milliseconds.
        let num_days = (end - start) / (86400*1000);
        let result = [];
        // Extra + 1 is that the date range must be inclusive of start & end
        for (let i = 0; i < num_days + 1; i++) {
            let next_date = new Date(start);
            next_date.setDate(next_date.getDate() + i);
            result.push(next_date);
        }
        return result;
    }

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
        // Break down start and end into individual days.
        let days = this._DateRangeToIndividualDays(start, end);
        // Query events for each day of days!
        let events = [];
        for (const day of days) {
            events.push(await Helioviewer.GetEventsForDay(day));
        }

        return this.MergeEvents(events);
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

