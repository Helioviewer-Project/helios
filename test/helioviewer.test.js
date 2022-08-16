import Helioviewer from '../API/helioviewer.js';

test('Changes API URL', () => {
    let test_url = 'http://testing';
    Helioviewer.SetApiUrl(test_url);
    expect(Helioviewer.api_url).toBe('http://testing/v2/');
});

