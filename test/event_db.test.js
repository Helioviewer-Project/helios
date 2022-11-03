import EventDB from "../Events/event_db.js";

test("Create range of dates", () => {
    let dates = EventDB._DateRangeToIndividualDays(new Date("2022-10-01 01:55:00Z"), new Date("2022-10-07 23:00:00Z"));
    let expected = new Date("2022-10-01 00:00:00Z");
    for (const date of dates) {
        expect(date.toISOString()).toBe(expected.toISOString());
        expected.setDate(expected.getDate() + 1);
    }
});
