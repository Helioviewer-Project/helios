import {parseDate} from "../common/dates";

test("Parsing dates", () => {
    let date = parseDate("2022-11-03 12:00:05");
    expect(date.toISOString()).toBe("2022-11-03T12:00:05.000Z");
});
