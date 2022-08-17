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

