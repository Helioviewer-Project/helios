import PositionFinder from '../Images/position_finder.js';

test('GetPosition', async () => {
    let scene_position = await PositionFinder.GetPosition(86417705);
    expect(JSON.stringify(scene_position)).toBe(`{"x":146.87084032651038,"y":-0.03703029480324776,"z":-7.78546898038041}`);
});
