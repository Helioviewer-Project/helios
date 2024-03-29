import Configuration from "../src/Configuration";

test("Earth sources is the expected list", () => {
    // earth_sources is generated with code.
    // It is intended to be all supported observatories along the sun-earth line.
    //
    // This test is intended to fail any time new sources are added
    // to make sure that the earth_sources array stays correct as new sources are supported.
    // Fix it by adding your new source to the earth_sources list or by updating the code that generates
    // earth sources in Configuration.js
    expect(Configuration.earth_sources).toStrictEqual([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        34, 35, 100001,
    ]);
});

/**
 * It's common to change the api url to localhost for testing.
 * This test makes sure it doesn't get checked in that way.
 */
test("Helios API URL is correct", () => {
    expect(Configuration.helios_api_url).toBe(
        "https://api.gl.helioviewer.org/"
    );
});
