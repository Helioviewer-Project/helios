import Configuration from "../src/Configuration.js";
import { Helios } from "../src/API/helios";
Configuration.helios_api_url = "http://127.0.0.1:5000/";

test("Saving a scene", async () => {
    let testLayers = [
        {
            source: 13,
            start: new Date(),
            end: new Date(),
            cadence: 86400,
            scale: 0.6,
        },
    ];
    global.window = {
        // This doesn't do a deep copy like structured clone, but it is good enough for this test.
        structuredClone: (obj) => obj,
    };
    let result = await Helios.SaveScene({
        created_at: new Date(),
        start: new Date(),
        end: new Date(),
        shared: false,
        thumbnail: "Test thumbnail",
        layers: testLayers,
    });
    expect(result).not.toHaveProperty("error");
    expect(typeof result).toBe("number");
});

test("Loading a scene", async () => {
    let result = await Helios.LoadScene(1);
    expect(result).not.toHaveProperty("error");
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("layers");
    expect(result["layers"].length).toBeGreaterThan(0);
});
test("Test the date", async () => {
    let result = await Helios.get_field_lines_gong([new Date()]);
    expect(Array.isArray(result)).toBe(true);
});
