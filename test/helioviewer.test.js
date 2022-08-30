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
    expect(JSON.stringify(result)).toBe("[{\"id\":\"131931338\",\"timestamp\":\"2022-08-28T00:00:17.000Z\"},{\"id\":\"131932387\",\"timestamp\":\"2022-08-28T01:00:17.000Z\"},{\"id\":\"131933669\",\"timestamp\":\"2022-08-28T02:00:05.000Z\"},{\"id\":\"131934691\",\"timestamp\":\"2022-08-28T03:00:05.000Z\"},{\"id\":\"131935712\",\"timestamp\":\"2022-08-28T04:00:05.000Z\"},{\"id\":\"131936807\",\"timestamp\":\"2022-08-28T05:00:05.000Z\"},{\"id\":\"131937796\",\"timestamp\":\"2022-08-28T06:00:05.000Z\"},{\"id\":\"131938892\",\"timestamp\":\"2022-08-28T07:00:05.000Z\"},{\"id\":\"131939924\",\"timestamp\":\"2022-08-28T08:00:05.000Z\"},{\"id\":\"131940983\",\"timestamp\":\"2022-08-28T09:00:05.000Z\"},{\"id\":\"131942066\",\"timestamp\":\"2022-08-28T10:00:05.000Z\"},{\"id\":\"131943039\",\"timestamp\":\"2022-08-28T11:00:05.000Z\"},{\"id\":\"131944077\",\"timestamp\":\"2022-08-28T12:00:05.000Z\"},{\"id\":\"131945119\",\"timestamp\":\"2022-08-28T13:00:05.000Z\"},{\"id\":\"131946256\",\"timestamp\":\"2022-08-28T14:00:05.000Z\"},{\"id\":\"131947293\",\"timestamp\":\"2022-08-28T15:00:05.000Z\"},{\"id\":\"131948312\",\"timestamp\":\"2022-08-28T16:00:05.000Z\"},{\"id\":\"131949361\",\"timestamp\":\"2022-08-28T16:59:53.000Z\"},{\"id\":\"131950615\",\"timestamp\":\"2022-08-28T18:00:05.000Z\"},{\"id\":\"131951983\",\"timestamp\":\"2022-08-28T19:00:05.000Z\"},{\"id\":\"131953300\",\"timestamp\":\"2022-08-28T20:00:05.000Z\"},{\"id\":\"131954829\",\"timestamp\":\"2022-08-28T21:00:29.000Z\"},{\"id\":\"131957032\",\"timestamp\":\"2022-08-28T22:00:05.000Z\"},{\"id\":\"131958067\",\"timestamp\":\"2022-08-28T23:00:05.000Z\"}]");
});
