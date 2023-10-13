/**
 * @jest-environment jsdom
 */

import { describe, it, jest, expect } from "@jest/globals";
import { useState } from "react";
import React from "react";
import { DateRange } from "../src/UI/navigation/control_tabs/data";
import DateRangePicker from "../src/UI/navigation/control_tabs/components/date_range_picker";
import { render, fireEvent } from "@testing-library/react";

// Fake mock for flatpickr to set the date to now whenever the input is interacted with.
jest.mock("react-flatpickr", () => ({ id, onChange }) => {
    return (
        <input
            id={id}
            onInput={(e) => {
                let date = new Date(parseInt(e.currentTarget.value));
                // Model the flatpickr behavior...
                // Flatpickr doesn't support UTC time, but all dates used in this application
                // expect UTC times, including the given input to this mock.
                // Convert the given date to a local time to mock the flatpickr behavior.
                let date_local = new Date(date);
                date_local.setMinutes(
                    date_local.getMinutes() + date.getTimezoneOffset()
                );
                onChange([date_local]);
            }}
        />
    );
});

describe("Date Range Picker", () => {
    it("Should not return infinite cadence when start/end are the same", async () => {
        // This wrapper exposes its internal state into p elements so that the
        // functionality of the DateRangePicker can be examined.
        let DateRangeWrapper = () => {
            let [dateRange, setDateRange] = useState<DateRange>({
                start: new Date(),
                end: new Date(),
                cadence: 0,
            });
            return (
                <>
                    <DateRangePicker
                        value={dateRange}
                        setValue={setDateRange}
                    />
                    <p aria-label="RangeStart">
                        {dateRange.start.toISOString()}
                    </p>
                    <p aria-label="RangeEnd">{dateRange.end.toISOString()}</p>
                    <p aria-label="RangeCadence">{dateRange.cadence}</p>
                </>
            );
        };

        const { getByLabelText, rerender, getAllByText } = render(
            <DateRangeWrapper />
        );
        // Fire event listeners to set the start/end inputs to the same date.
        // The date is set to the given unix timestamp
        // Tuesday, October 10, 2023 0:00:00 UTC
        let date = 1696896000000;
        let startInput = getByLabelText("Start");
        fireEvent.input(startInput, { target: { value: date } });
        // Set the end input to
        // Tuesday, October 10, 2023 0:00:00 UTC
        let endInput = getByLabelText("End");
        fireEvent.input(endInput, { target: { value: date } });
        // Rerender the component to apply the new values
        rerender(<DateRangeWrapper />);
        // Assert the desired values have been rendered
        let dateRangeTexts = getAllByText("2023-10-10T00:00:00.000Z");
        // Expect the wrapper to print both start and end as the same time.
        // Which means there should be 2 p elements with the same date.
        expect(dateRangeTexts.length).toBe(2);
        let cadenceHtml = getByLabelText("RangeCadence");
        // The issue this test is testing is that cadence is computed to be 0
        // when start/end are the same. Which leads the application to get stuck
        // in an infinite loop when it attempts to iterate over start/end date ranges.
        let cadence = parseInt(cadenceHtml.textContent ?? "0");
        expect(cadence).not.toBe(0);
    });
});
