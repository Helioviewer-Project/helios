import {GetEventLabel} from "../common/event.js";
/**
 * Renders events with checkboxes to show/hide them.
 */
class EventUI {
    constructor() {
        /**
         * Events currently being tracked
         */
        this._events = [];
    }

    AddEvent(event, marker) {
        this._events.push({
            event: event,
            marker: marker,
            enabled: true
        });
    }

    /**
     * Clears the currently rendered HTML.
     */
    _clear() {
        let el = document.getElementById('js-events');
        el.remove();
    }

    /**
     * Sorts the event list
     */
    _sort() {
        this._events.sort((a, b) => {
            if (a.event.concept == b.event.concept) {
                let a_label = GetEventLabel(a.event);
                let b_label = GetEventLabel(b.event);
                return a_label > b_label;
            } else {
                return a.event.concept > b.event.concept;
            }
        });
    }

    render() {
        this._sort();
        // Clear currently rendered events
        this._clear();
        // Create a new div to add everything into
        let div = document.createElement('div');
        div.id = 'js-events';
        // Render event controls into the div
        this._renderEvents(div);
        // Add it to the DOM
        document.getElementById('current-events').appendChild(div);
    }

    /**
     * Adds event controls to the given element
     */
    _renderEvents(div) {
        for (const item of this._events) {
            this._renderSingleEvent(div, item);
        }
    }

    /**
     * Adds one event to the given element
     */
    _renderSingleEvent(div, item) {
        let data = item.event;
        let li = this._getListForEventType(div, data.concept);
        li.appendChild(this._createEventControls(item))
    }

    _getListForEventType(div, concept) {
        let list = div.querySelector(`ul[event-type="${concept}"]`);
        if (!list) {
            list = this._createListForConcept(concept);
            list.classList.add("expanded");
            list.classList.add("event-list");
        }

        let header = div.querySelector(`h2[event-type="${concept}"]`);
        if (!header) {
            header = this._createHeaderForConcept(concept);
            div.appendChild(header);
            div.appendChild(list);
            header.addEventListener('click', (e) => {
                list.classList.toggle("expanded");
            });
        }

        return list;
    }

    _createHeaderForConcept(concept) {
        let header = document.createElement('h2');
        header.classList.add("event-header");
        header.textContent = concept;
        header.setAttribute("event-type", concept);
        return header;
    }

    _createListForConcept(concept) {
        let ul = document.createElement('ul');
        ul.setAttribute("event-type", concept);
        return ul;
    }

    _createEventControls(item) {
        let li = document.createElement('li');
        li.textContent = GetEventLabel(item.event);
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        if (item.enabled) {
            checkbox.checked = true;
        }
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                item.marker.Enable();
            } else {
                item.marker.Disable();
            }
        });
        li.addEventListener('click', () => {
            checkbox.click();
        });
        li.appendChild(checkbox);
        return li;
    }
}

let ui = new EventUI();
export default ui;
