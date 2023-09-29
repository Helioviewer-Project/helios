import Config from "../Configuration.js";
import { ToAPIDate, ToDateString } from "../common/dates";
import { ToCoordinates } from "./common";
import { Favorite, Favorites } from "./favorites";

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

    static async SaveScene(favorite: Favorite): Promise<number> {
        let copy: any = window.structuredClone(favorite);
        copy.created_at = ToDateString(copy.created_at);
        copy.start = ToDateString(copy.start);
        copy.end = ToDateString(copy.end);
        for (let i = 0; i < copy.layers.length; i++) {
            copy.layers[i].start = ToDateString(copy.layers[i].start as Date);
            copy.layers[i].end = ToDateString(copy.layers[i].end as Date);
        }
        let response = await fetch(Config.helios_api_url + "scene", {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(copy), // body data type must match "Content-Type" header
        });
        let result = await response.json();
        if (result.hasOwnProperty("error")) {
            throw result["error"];
        }
        return result.id;
    }

    static async LoadScene(id: number): Promise<Favorite> {
        let response = await fetch(Config.helios_api_url + "scene/" + id);
        let data = await response.json();
        return Favorites.RestoreDates([data])[0];
    }

    static async GetRecentlyShared(): Promise<Favorite[]> {
        let response = await fetch(Config.helios_api_url + "scene/latest/10");
        let data = await response.json();
        return Favorites.RestoreDates(data);
    }

    static async get_field_lines_gong(
        date: Array<Date>,
        detail: number = 50
    ): Promise<Array<Object>> {
        // Construct a query string in the form date=<date1>&date=<date2>...
        let date_strings = date.map((d) => "date=" + ToDateString(d));
        let query_params = date_strings.join("&");
        let url =
            Config.helios_api_url +
            "pfss/gong?detail=" +
            detail +
            "&" +
            query_params;
        let response = await fetch(url);
        let data = await response.json();
        return data;
    }

    static async GetEarthPosition(date: Date) {
        let url = Config.helios_api_url + "/earth/" + ToDateString(date);
        let response = await fetch(url);
        let data = await response.json();
        return ToCoordinates(data);
    }
}

export { Helios };
