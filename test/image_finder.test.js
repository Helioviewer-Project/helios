import ImageFinder from '../Images/image_finder.js';

test('Getting a list of image urls', async () => {
    // Query AIA 304 (13) for a 5 minute range with 60 seconds between each image at scale 8 (512x512)
    let images = await ImageFinder.GetImages(13, new Date("2022-08-10T00:00:00Z"), new Date("2022-08-10T00:05:00Z"), 60, 8);
    expect(JSON.stringify(images)).toBe(`[{"url":"https://api.helioviewer.org/v2/downloadImage/?id=131415737&scale=8","timestamp":"2022-08-10T04:00:05.000Z"},{"url":"https://api.helioviewer.org/v2/downloadImage/?id=131415735&scale=8","timestamp":"2022-08-10T04:01:17.000Z"},{"url":"https://api.helioviewer.org/v2/downloadImage/?id=131415734&scale=8","timestamp":"2022-08-10T04:01:53.000Z"},{"url":"https://api.helioviewer.org/v2/downloadImage/?id=131415732&scale=8","timestamp":"2022-08-10T04:03:05.000Z"},{"url":"https://api.helioviewer.org/v2/downloadImage/?id=131415730&scale=8","timestamp":"2022-08-10T04:04:17.000Z"}]`);
});

