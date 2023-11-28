import { describe, it, expect } from "@jest/globals";
import { Preferences } from "@API/preferences";
import "./facade/localStorage";

describe("Preferences", () => {
    it("Should provide default values no preferences exist", () => {
        expect(Preferences.resolution).toBe(1024);
    });
    it("Should allow updates", () => {
        Preferences.resolution = 512;
        expect(Preferences.resolution).toBe(512);
    });
    it("Should automatically save updates in localStorage", () => {
        Preferences.resolution = 2048;
        let prefs = JSON.parse(localStorage.getItem("preferences") as string);
        expect(prefs.resolution).toBe(2048);
        expect(Preferences.resolution).toBe(2048);
    });
});
