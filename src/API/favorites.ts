import Scene from "../Scene/scene";
import { SceneLayer } from "../common/types";

const FAVORITES_KEY = "favorites";

type Favorite = {
    name: string;
    saved_at: Date;
    layers: SceneLayer[];
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
        return this._RestoreDates(parsedFavorites);
    }

    /**
     * Retores stringified dates in the Favorite object
     *
     * When saving items to localStorage they're stored as strings.
     * JSON.parse doesn't restore dates back to Date objects, so this function does that.
     */
    _RestoreDates(favorites: Favorite[]): Favorite[] {
        return favorites.map((favorite) => {
            favorite.saved_at = new Date(favorite.saved_at);
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

    AddFavorite(title: string) {
        let newFavorite: Favorite = {
            name: title,
            saved_at: new Date(),
            layers: this.scene.GetLayers()
        };
        let storedFavorites = this.GetFavorites();
        storedFavorites.push(newFavorite);
        this.SaveFavorites(storedFavorites);
    }
}

export {Favorites, Favorite}