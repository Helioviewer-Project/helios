import Config from "../Configuration.js";
import Helioviewer from "../API/helioviewer.js";
import { HelioviewerToHelios } from "../common/helioviewer_source_map.js";
import { parseDate } from "../common/dates";
import { Sources } from "./navigation/control_tabs/components/datasource_picker.js";
import { GetImageScaleForResolution } from "../common/resolution_lookup.js";
import { Preferences } from "@API/preferences";

/**
 * Adds the given movie to the scene
 * @param {Scene} scene
 * @param {string} movieId
 * @param {(layer: ModelInfo) => void} onLayerCreated Executed when a new layer is added by the helioviewer movie
 */
async function LoadHelioviewerMovie(scene, movieId, onLayerCreated) {
    let data = await GetMovieData(movieId);
    await AddMovieToScene(scene, data, onLayerCreated);
}

async function GetMovieData(id) {
    let data = await Helioviewer.GetMovieDetails(id);
    return data;
}

async function AddMovieToScene(scene, data, addLayer) {
    let dates = GetDateRange(data);
    let sources = ParseLayerString(data.layers);
    let cadence = ParseCadence(dates, data);
    let layerOrder = 1;
    for (const source of sources) {
        let scale = GetImageScaleForResolution(
            Preferences.resolution,
            source
        );
        let layer = await scene.AddToScene(
            source,
            dates[0],
            dates[1],
            cadence,
            scale,
            layerOrder
        );
        layerOrder += 1;
        // TODO: Make sure I'm managing layers somehow
        addLayer(layer);
        // TODO: Play movie
    }
}

/**
 * Returns the date range from the given movie data
 * @param {Object} Movie data returned from the API
 */
function GetDateRange(data) {
    let start = parseDate(data.startDate);
    let end = parseDate(data.endDate);
    return [start, end];
}

/**
 * Parses a layer string into individual layer data
 * @return {string[][]} Layer data broken up into components
 */
function ParseLayerString(layer_string) {
    let split = layer_string.split("],[");
    let layers = [];
    for (const layer of split) {
        layers.push(layer.replace("[", "").replace("]", "").split(","));
    }
    return GetLayerSources(layers);
}

/**
 * Returns the source IDs for the given layer sources
 * @param {string[][]} Layer data
 * @returns {number[]} Source IDs
 */
function GetLayerSources(layers) {
    // The format of this data is assumed to always be in this format
    // [data1, data2, ..., dataN, Measurement, ...]
    // So the idea is that we'll match all data pieces up to and including measurement to one of our sources
    let source_list = Sources;
    let sources_found = [];
    for (const layer of layers) {
        sources_found.push(MatchLayerToSource(layer, source_list));
    }
    return sources_found;
}

function MatchLayerToSource(layer, source_list) {
    let filtered_sources = Object.entries(source_list);
    // For each element in layer
    for (var data of layer) {
        var str_to_check = CleanSource(data);
        // Filter the option list down via that element
        // by checking if the text contains it.
        filtered_sources = filtered_sources.filter(
            (e) => e[1].name.indexOf(str_to_check) >= 0
        );
        // If the element is a number exit the loop
        // The element is a number if parsing it does not result in NaN
        if (!isNaN(parseInt(data)) || filtered_sources.length == 1) {
            break;
        }
    }
    // If there is only one result, return its value.
    if (filtered_sources.length == 1) {
        return parseInt(filtered_sources[0][0]);
    } else {
        // If there are multiple results, throw error
        throw "Data source " + GetHumanReadableLayer(layer) + " is unsupported";
    }
}

function CleanSource(str) {
    return HelioviewerToHelios(str);
}

function GetHumanReadableLayer(layer) {
    let cutoff = layer.indexOf("1");
    if (cutoff == -1) {
        cutoff = layer.indexOf("0");
    }
    if (cutoff == -1) {
        cutoff = layer.length;
    }

    let result = layer.slice(0, cutoff);
    return result.join(" ");
}

/**
 * Parses the cadence of the movie. Computed from the date range and FPS.
 */
function ParseCadence(dates, data) {
    let seconds = (dates[1] - dates[0]) / 1000;
    return seconds / data.numFrames;
}

export { LoadHelioviewerMovie };
