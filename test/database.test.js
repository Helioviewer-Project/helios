import Database from '../Images/database.js';
import {ToAPIUrl} from '../common/dates.js';

test.skip('Get a list of image information', async () => {
    // Test AIA 304 (13) for 4 images 6 hours apart on Jan 01, 2022 to Jan 02, 2022 at scale 8 (512x512)
    let images = await Database.GetImages(13, new Date("2022-01-01T00:00:00Z"), new Date("2022-01-02T00:00:00Z"), 3600 * 6, 8);
    expect(JSON.stringify(images)).toMatch(new RegExp(`^.*"date":"2021-12-31T23:59:53.000Z".*$`));
});

