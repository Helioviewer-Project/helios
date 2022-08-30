import GeometryService from '../API/geometry_service.js';

test('Getting a known position', async () => {
    let position_test = await GeometryService.GetPosition(new Date("2021-12-08T10:01:53Z"), "SDO");
    expect(JSON.stringify(position_test)).toBe(`{"x":-147394097.10358292,"y":-25309.653499118984,"z":173528.62656160444}`);
});

test('Getting a known position with millisecond precision', async () => {
    let position = await GeometryService.GetPosition(new Date("2021-12-08T10:00:00.555Z"), "SDO");
    expect(JSON.stringify(position)).toBe(`{"x":-147394243.23615438,"y":-25047.277186552063,"z":173289.07114257663}`);
});

test('No data available', async () => {
    expect.assertions(1);
    try {
        let position = await GeometryService.GetPosition(new Date("2022-12-08T10:00:00.555Z"), "SDO");
    } catch (e) {
        expect(e).toBe("Could not load position data");
    }
});
