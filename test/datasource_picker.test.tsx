/**
 * @jest-environment jsdom
 */

import React, { useState } from "react";
import { describe, it, expect } from "@jest/globals";
import { render, act, fireEvent } from "@testing-library/react";
import DatasourcePicker from "@UI/navigation/control_tabs/components/datasource_picker";

describe("Datsource Picker", () => {
    it("renders the select dropdown", async () => {
        let renderer = render(<DatasourcePicker />);

        let aia_304_option = await renderer.findByText("SDO AIA 304");
        expect(aia_304_option.getAttribute("value")).toBe("13");

        let gong_pfss_option = await renderer.findByText("GONG PFSS");
        expect(gong_pfss_option.getAttribute("value")).toBe("100001");
    });

    it("returns the correct value for selected items", async () => {
        // Use a test harness to print the selected value returned by the datasource picker.
        let TestHarness = () => {
            let [selected, setSelected] = useState(13); // default to AIA 304
            return (
                <>
                    <DatasourcePicker
                        selected={selected}
                        setSelected={setSelected}
                    />
                    <p>Selected {selected}</p>
                </>
            );
        };
        // Render the test harness
        let renderer = render(<TestHarness />);
        // Confirm the initial value is the one set by the test harness
        let printed_selection = await renderer.findByText("Selected 13");
        expect(printed_selection.textContent).toBe("Selected 13");
        let select_dropdown = (await renderer.findByLabelText(
            "Data Source"
        )) as HTMLSelectElement;
        expect(select_dropdown.value).toBe("13");

        // Change selected value to LASCO C2
        let lasco_c2_option = (await renderer.findByText(
            "SOHO LASCO C2"
        )) as HTMLOptionElement;
        fireEvent.change(select_dropdown, {
            target: { value: lasco_c2_option.value },
        });

        expect(select_dropdown.value).toBe("4");
        expect(printed_selection.textContent).toBe("Selected 4");
    });
});
