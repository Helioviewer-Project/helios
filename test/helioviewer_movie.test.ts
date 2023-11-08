import { describe, it, expect, jest } from "@jest/globals";
import { LoadHelioviewerMovie } from "@UI/helioviewer_movie";
import "./facade/localStorage";

describe("Helioviewer Movie", () => {
    it("should load movie details", async () => {
        let mock_scene = {
            AddToScene: jest.fn(),
        };
        await LoadHelioviewerMovie(mock_scene, "D0ZN5", () => {});
        // Expect 3 layers to be added to the scene. The test movie uses:
        // - SOHO LASCO C3: id 5
        // - SOHO LASCO C2: id 4
        // - SDO AIA 304: id 13
        expect(mock_scene.AddToScene.mock.calls.length).toBe(3);
        expect(mock_scene.AddToScene.mock.calls[0][0]).toBe(4);
        expect(mock_scene.AddToScene.mock.calls[1][0]).toBe(5);
        expect(mock_scene.AddToScene.mock.calls[2][0]).toBe(13);
    });
});
