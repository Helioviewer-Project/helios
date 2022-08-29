import PositionFinder from '../Images/position_finder.js';

test('GetPosition', async () => {
    let scene_position = await PositionFinder.GetPosition(new Date("2021-12-08T10:01:53Z"), "SDO");
    expect(JSON.stringify(scene_position)).toBe(`{"x":-147.3940971035829,"y":-0.025309653499118984,"z":0.17352862656160445}`);
});
