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
