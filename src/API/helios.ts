import Config from "../Configuration.js";
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
}

export { Helios }