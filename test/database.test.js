import Database from '../Images/database.js';
import {ToAPIUrl} from '../common/dates.js';

test('Get a list of image information', async () => {
    // Test AIA 304 (13) for 4 images 6 hours apart on Jan 01, 2022 to Jan 02, 2022 at scale 8 (512x512)
    let images = await Database.GetImages(13, new Date("2022-01-01T00:00:00Z"), new Date("2022-01-02T00:00:00Z"), 3600 * 6, 8);
    expect(JSON.stringify(images)).toBe(`[{"date":"2021-12-31T23:59:53.000Z","url":"https://api.helioviewer.org/v2/downloadImage/?id=89940604&scale=8","position":{"x":-146.8840775069771,"y":0.034684803315327965,"z":7.705875591146521}},{"date":"2022-01-01T06:03:41.000Z","url":"https://api.helioviewer.org/v2/downloadImage/?id=79024764&scale=8","position":{"x":-146.93244853183467,"y":0.012004112762003671,"z":7.7995473518531915}},{"date":"2022-01-01T12:03:05.000Z","url":"https://api.helioviewer.org/v2/downloadImage/?id=79024753&scale=8","position":{"x":-146.91957375388898,"y":-0.03476724412513478,"z":7.838413743966289}},{"date":"2022-01-01T18:08:29.000Z","url":"https://api.helioviewer.org/v2/downloadImage/?id=79024787&scale=8","position":{"x":-146.86219820967082,"y":-0.011247537241352256,"z":7.8973633437448365}}]`);
});

test('Failed to load', async () => {
    expect.assertions(1);
    try {
        let images = await Database.GetImages(13, new Date("2022-12-01T00:00:00Z"), new Date("2022-12-02T00:00:00Z"), 3600 * 12, 8);
    } catch (e) {
        expect(e).toBe('Failed to load images from database');
    }
});
