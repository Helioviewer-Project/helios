import { Favorites } from "../src/API/favorites";

class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }
}

global.localStorage = new LocalStorageMock();

class SceneMock {
    GetLayers() {
        return [
            {
                source: 8,
                start: new Date("2023-01-01"),
                end: new Date("2023-01-02"),
                cadence: 60,
                scale: 0.6,
            },
        ];
    }

    GetTimeRange() {
        return [new Date(), new Date()];
    }
}

test("Get favorites when it is null", () => {
    let favorites = new Favorites(new SceneMock());
    let emptyFavorites = favorites.GetFavorites();
    expect(emptyFavorites).toStrictEqual([]);
});

test("Add Favorite", () => {
    let scene = new SceneMock();
    let favorites = new Favorites(scene);
    favorites.AddFavorite("data:thumbnail blob");
    let storedFavorites = favorites.GetFavorites();
    expect(storedFavorites.length).toBe(1);
    // thumbnail is ignored for now.
    expect(storedFavorites[0].thumbnail).toBe("");
    expect(storedFavorites[0].layers).toStrictEqual(scene.GetLayers());
});
