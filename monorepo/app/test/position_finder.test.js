import PositionFinder from "../Images/position_finder.js";

test("GetPosition", async () => {
    let scene_position = await PositionFinder.GetPosition(86417705);
    expect(JSON.stringify(scene_position)).toBe(
        `{"x":117.10125976818252,\"y\":-7.880125864472047,\"z\":88.701916413244}`
    );
});
