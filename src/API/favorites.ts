import Scene from "../Scene/scene";
import { ToDateString } from "../common/dates";
import { GetSourceName } from "../common/sources";
import { SceneLayer } from "../common/types";

const FAVORITES_KEY = "favorites";

type Favorite = {
    created_at: Date;
    layers: SceneLayer[];
    start: Date;
    end: Date;
}

/**
 * Interface for managing favorites.
 * Everything is saved to LocalStorage.
 */
class Favorites {
    /** Handle to the main scene */
    private scene: Scene
    constructor(scene: Scene) {
        this.scene = scene;
    }

    GetFavorites(): Favorite[] {
        let favorites = localStorage.getItem(FAVORITES_KEY) ?? "[]";
        // Restore date objects
        let parsedFavorites: Favorite[] = JSON.parse(favorites);
        return Favorites.RestoreDates(parsedFavorites).reverse();
    }

    /**
     * Retores stringified dates in the Favorite object
     *
     * When saving items to localStorage or the db they're stored as strings.
     * JSON.parse doesn't restore dates back to Date objects, so this function does that.
     */
    static RestoreDates(favorites: Favorite[]): Favorite[] {
        return favorites.map((favorite) => {
            favorite.created_at = new Date(favorite.created_at);
            favorite.start = new Date(favorite.start);
            favorite.end = new Date(favorite.end);
            favorite.layers = favorite.layers.map((layer) => {
                layer.start = new Date(layer.start);
                layer.end = new Date(layer.end);
                return layer;
            })
            return favorite;
        });
    }

    SaveFavorites(favorites: Favorite[]) {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }

    /**
     * Creates a title from the current scene information
     */
    CreateTitle(favorite: Favorite): string {
        let layerNames = favorite.layers.map((layer) => GetSourceName(layer.source));
        return `${layerNames.join(", ")} | ${ToDateString(favorite.start)} to ${ToDateString(favorite.end)}`
    }

    AddFavorite() {
        let dateRange = this.scene.GetTimeRange();
        let newFavorite: Favorite = {
            created_at: new Date(),
            layers: this.scene.GetLayers(),
            start: dateRange[0],
            end: dateRange[1]
        };
        let storedFavorites = this.GetFavorites();
        storedFavorites.push(newFavorite);
        this.SaveFavorites(storedFavorites);
    }
}

export {Favorites, Favorite}