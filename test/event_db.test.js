import EventDB from "../src/Events/event_db.js";

test("Create range of dates", () => {
    let dates = EventDB._DateRangeToIndividualDays(
        new Date("2022-10-01 01:55:00Z"),
        new Date("2022-10-07 23:00:00Z")
    );

    // Expect 7 dates, October 1, 2, 3, 4, 5, 6, and 7.
    expect(dates.length).toBe(7);

    let expected = new Date("2022-10-01 12:00:00Z");
    for (const date of dates) {
        expect(date.toISOString()).toBe(expected.toISOString());
        expected.setDate(expected.getDate() + 1);
    }
});

test("Create range of dates given one day", () => {
    let dates = EventDB._DateRangeToIndividualDays(
        new Date("2022-10-01 01:55:00Z"),
        new Date("2022-10-01 23:00:00Z")
    );
    let expected = new Date("2022-10-01 12:00:00Z");
    expect(dates[0].toISOString()).toBe(expected.toISOString());
});

test.skip("Get events without duplicates", async () => {
    let events = await EventDB.GetEvents(
        new Date("2022-10-01 01:55:00Z"),
        new Date("2022-10-03 23:00:00Z")
    );
    let known_events = new Set();
    for (const e of events) {
        let id = e.kb_archivid;
        if (known_events.has(id)) {
            throw "Found duplicate event";
        }
        known_events.add(id);
    }
});
