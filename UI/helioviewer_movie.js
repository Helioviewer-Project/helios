import Config from "../Configuration.js";
import Helioviewer from "../API/helioviewer.js";
import {HelioviewerToHelios} from "../common/helioviewer_source_map.js";
import {parseDate} from "../common/dates.js";
import ResolutionPicker from "./resolution_picker.js";
import SourceControls from "./source_controls.js";
import AnimationControls from "./animation_controls.js";
import DatePicker from "./date_range_picker.js";

/** * Helioviewer Movie integration.
 * This module allows you to specify a Movie ID generated by helioviewer and it
 * will be rendered here.
 */
class HelioviewerMovie {
    constructor() {
        // We need to filter an HTMLCollection layer, so add the filter function to it.
        HTMLCollection.prototype.filter = Array.prototype.filter;
        // Input element for the movie id
        this._input = document.getElementById(Config.helioviewer_movie_input_id);
        // Submit button to begin loading
        this._submit = document.getElementById(Config.helioviewer_movie_load_button);
        this._InitSubmitListener();
        this._LoadFromUrl();
    }

    /**
     * Loads a movie from the url if it was given.
     */
    _LoadFromUrl() {
        const params = new Proxy(new URLSearchParams(window.location.search), {
          get: (searchParams, prop) => searchParams.get(prop),
        });

        if (params.movie) {
            this._input.value = params.movie;
            this._submit.click();
        }
    }

    _InitSubmitListener() {
        let self = this;
        this._submit.addEventListener("click", () => {self.Submit();});
    }

    /**
     * Queries the API for movie data
     * @returns {Object} containing movie data
     */
    async _GetMovieData(id) {
        let data = await Helioviewer.GetMovieDetails(id);
        return data;
    }

    /**
     * Returns the date range from the given movie data
     * @param {Object} Movie data returned from the API
     */
    _GetDateRange(data) {
        let start = parseDate(data.startDate);
        let end = parseDate(data.endDate);
        return [start, end];
    }

    /**
     * Parses a layer string into individual layer data
     * @return {string[][]} Layer data broken up into components
     */
    _ParseLayerString(layer_string) {
        let split = layer_string.split("],[");
        let layers = [];
        for (const layer of split) {
            layers.push(
                layer.replace("[", "")
                .replace("]", "")
                .split(",")
            );
        }
        return this._GetLayerSources(layers);
    }

    _CleanSource(str) {
        return HelioviewerToHelios(str);
    }

    _GetHumanReadableLayer(layer) {
        let cutoff = layer.indexOf('1');
        if (cutoff == -1) {
            cutoff = layer.indexOf('0');
        } if (cutoff == -1) {
            cutoff = layer.length;
        }

        let result = layer.slice(0, cutoff);
        return result.join(" ");
    }

    _MatchLayerToSource(layer, source_list) {
        let filtered_sources = source_list;
        // For each element in layer
        for (var data of layer) {
            var str_to_check = this._CleanSource(data);
            // Filter the option list down via that element
            // by checking if the text contains it.
            filtered_sources = filtered_sources.filter((e) => e.textContent.indexOf(str_to_check) >= 0);
            // If the element is a number exit the loop
            // The element is a number if parsing it does not result in NaN
            if (!isNaN(parseInt(data)) || filtered_sources.length == 1) {
                break;
            }
        }
        // If there is only one result, return its value.
        if (filtered_sources.length == 1) {
            return parseInt(filtered_sources[0].value);
        } else {
            // If there are multiple results, throw error
            throw "Data source " + this._GetHumanReadableLayer(layer) + " is unsupported";
        }
    }

    /**
     * Returns the source IDs for the given layer sources
     * @param {string[][]} Layer data
     * @returns {number[]} Source IDs
     */
    _GetLayerSources(layers) {
        // The format of this data is assumed to always be in this format
        // [data1, data2, ..., dataN, Measurement, ...]
        // So the idea is that we'll match all data pieces up to and including measurement to one of our sources
        let source_list = document.getElementById(Config.source_selector_id).children;
        let sources_found = [];
        for (const layer of layers) {
            sources_found.push(this._MatchLayerToSource(layer, source_list));
        }
        return sources_found;
    }

    /**
     * Parses the cadence of the movie. Computed from the date range and FPS.
     */
    _ParseCadence(dates, data) {
        let seconds = (dates[1] - dates[0]) / 1000;
        return seconds / data.numFrames;
    }

    /**
     * Get resolution that the video should be rendered at.
     * This is based on user input
     * @param {number} source id
     */
    _GetResolution(source) {
        return ResolutionPicker.GetResolution();
    }

    /**
     * Adds the movie details to the scene
     * @param {Object} data
     */
    _LoadMovie(data) {
        let dates = this._GetDateRange(data);
        let sources = this._ParseLayerString(data.layers);
        let cadence = this._ParseCadence(dates, data);
        for (const source of sources) {
            let resolution = this._GetResolution(source);
            let promise = SourceControls.AddSourceWithParams(dates[0], dates[1], cadence, source, resolution);
            // If last source
            if (source == sources[sources.length - 1]) {
                promise.then(() => {
                    AnimationControls.Play();
                })
            }
        }
        this._UpdateAnimationUI(data);
        this._UpdateDatePickerUI(dates, data.numFrames);
    }

    _UpdateAnimationUI(data) {
        AnimationControls.SetValues({
            fps: data.frameRate
        });
    }

    _UpdateDatePickerUI(dates, frames) {
        DatePicker.SetValues({
            start: dates[0],
            end: dates[1],
            frames: frames
        });
    }

    /**
     * Called on button click to submit the movie id for processing
     */
    async Submit() {
        try {
            var movie_id = this._input.value;
            let data = await this._GetMovieData(movie_id);
            this._LoadMovie(data);
        } catch (e) {
            alert(e);
        }
    }
};
new HelioviewerMovie();
