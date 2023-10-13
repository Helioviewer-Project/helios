import Configuration from "../src/Configuration.js";
import Helioviewer from "../src/API/helioviewer.js";

test("Getting API URL with trailing /", () => {
    Configuration.helioviewer_url = "http://testing";
    let url = Helioviewer.GetApiUrl();
    expect(url).toBe("http://testing/v2/");
});

test("Getting API URL without trailing /", () => {
    Configuration.helioviewer_url = "http://testing/";
    let url = Helioviewer.GetApiUrl();
    expect(url).toBe("http://testing/v2/");
});

test("Query a single date from helioviewer", async () => {
    Configuration.helioviewer_url = "https://api.helioviewer.org/";
    let result = await Helioviewer._GetClosestImage(13, new Date("2022-08-28"));
    expect(result.id).toBe("131931338");
});

test("Query a range of data from helioviewer", async () => {
    Configuration.helioviewer_url = "https://api.helioviewer.org/";
    let result = await Helioviewer.QueryImages(
        13,
        new Date("2022-08-28"),
        new Date("2022-08-29"),
        3600
    );
    // Note this test depends on your time zone because "Date" stringifies to local time.
    // Test expectation is written for EDT
    expect(JSON.stringify(result)).toMatch(
        new RegExp('^.*"id":"131931338".*$')
    );
});

test("Get event data over date range", async () => {
    // Not failing means passing...
    let events = await Helioviewer.GetEventsForDay(
        new Date("2022-10-01 00:00:00Z")
    );
});

test.skip("Get normalized event coordinates", async () => {
    let data = await Helioviewer.GetEventCoordinates({
        event_coordsys: "UTC-HPC-TOPO",
        event_coord1: 500,
        event_coord2: 500,
        event_coord3: null,
        event_starttime: "2022-10-10T00:00:00",
        obs_instrument: "AIA",
        event_coordunit: "arcsec",
    });
    let keys = Object.keys(data);
    expect(keys).toContain("observer");
    expect(keys).toContain("event");
});
