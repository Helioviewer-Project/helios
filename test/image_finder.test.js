import ImageFinder from "../src/Images/image_finder.js";

test.skip("Getting a list of image urls", async () => {
    // Query AIA 304 (13) for a 5 minute range with 60 seconds between each image at scale 8 (512x512)
    let images = await ImageFinder.GetImages(
        13,
        new Date("2022-08-10T00:00:00Z"),
        new Date("2022-08-10T00:05:00Z"),
        60,
        8
    );
    expect(JSON.stringify(images)).toMatch(
        new RegExp(
            '^.*"url":"https://api.helioviewer.org/v2/downloadImage/\\?id=131415737&scale=8.*$'
        )
    );
});
