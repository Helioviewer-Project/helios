import Configuration from '../Configuration.js';
import Helioviewer from '../API/helioviewer.js';

test('Getting API URL with trailing /', () => {
    Configuration.Update({
        helioviewer_url: "http://testing"
    });
    let url = Helioviewer.GetApiUrl();
    expect(url).toBe('http://testing/v2/');
});

test('Getting API URL without trailing /', () => {
    Configuration.Update({
        helioviewer_url: "http://testing/"
    });
    let url = Helioviewer.GetApiUrl();
    expect(url).toBe('http://testing/v2/');
});

test('Query a single date from helioviewer', async () => {
    Configuration.Update({
        helioviewer_url: "https://api.helioviewer.org/"
    });
    let result = await Helioviewer._GetClosestImage(13, new Date("2022-08-28"));
    expect(result.id).toBe('131931338');
});

test('Query a range of data from helioviewer', async () => {
    Configuration.Update({
        helioviewer_url: "https://api.helioviewer.org/"
    });

    let result = await Helioviewer.QueryImages(13, new Date("2022-08-28"), new Date("2022-08-29"), 3600);
    // Note this test depends on your time zone because "Date" stringifies to local time.
    // Test expectation is written for EDT
    expect(JSON.stringify(result)).toMatch(new RegExp('^.*"id":"131931338".*$'));
});

test("Get event data over date range", async () => {
    // Not failing means passing...
    let events = await Helioviewer.GetEventsForDay(new Date("2022-10-01 00:00:00Z"));
});
