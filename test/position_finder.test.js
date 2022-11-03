import PositionFinder from '../Images/position_finder.js';

test('GetPosition', async () => {
    let scene_position = await PositionFinder.GetPosition(86417705);
    expect(JSON.stringify(scene_position)).toBe(`{\"x\":117.10139460414392,\"y\":-7.88012587556343,\"z\":88.70173850827965}`);
});
