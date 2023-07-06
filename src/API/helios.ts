import Config from "../Configuration.js";
import { ToAPIDate, ToDateString } from "../common/dates";
import { SceneLayer } from "../common/types";
import { ToCoordinates } from "./common";

class Helios {
    /**
     * Returns the observer position of a jp2 image
     * @param {number} id ID of the jp2 image
     * @returns Coordinates
     */
    static async GetJp2Observer(id) {
        let api_url = Config.helios_api_url + "observer/position?id=" + id;
        let result = await fetch(api_url);
        let data = await result.json();
        if (data.hasOwnProperty("error")) {
            throw data.error;
        }
        return ToCoordinates(data);
    }

    static async SaveScene(layers: SceneLayer[]): Promise<number> {
        for (let i = 0; i < layers.length; i ++) {
            layers[i].start = ToDateString(layers[i].start as Date);
            layers[i].end = ToDateString(layers[i].end as Date);
        }
        let response = await fetch(Config.helios_api_url + "scene", {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(layers), // body data type must match "Content-Type" header
        });
        let result = await response.json();
        return result.id;
    }

    static async LoadScene(id: number): Promise<SceneLayer[]> {
        let response = await fetch(Config.helios_api_url + "scene/" + id);
        let data = await response.json();
        return data as SceneLayer[];
    }
}

export { Helios }