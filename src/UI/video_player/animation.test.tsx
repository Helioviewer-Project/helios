/**
 * @jest-environment jsdom
 */

import React from "react";
import { describe, it, expect } from "@jest/globals";
import { render, act, RenderResult } from "@testing-library/react";
import AnimationControls from "./animation";

interface TestHarness {
    UpdateAnimationDate: (date: Date) => void;
    render: RenderResult;
}

/**
 * Test helper for rendering the animation controls.
 * Returns a TestHarness which contains the function for executing the "OnSceneTimeUpdated" callback
 * and the render test helpers.
 */
function RenderAnimationControls(
    dateRange: Date[],
    frameCount: number
): TestHarness {
    let UpdateAnimationDate: (date: Date) => void;
    let result = render(
        <AnimationControls
            visible={true}
            onClose={() => {}}
            GetSceneTime={() => new Date()}
            GetSceneTimeRange={() => dateRange}
            GetMaxFrameCount={() => frameCount}
            SetSceneTime={() => {}}
            OnSceneTimeUpdated={(fn) => {
                UpdateAnimationDate = fn;
            }}
        />
    );
    return { UpdateAnimationDate: UpdateAnimationDate, render: result };
}

describe("Animation Component", () => {
    it("Should choose the correct frame for the given date", () => {
        /**
         * Render the animation controls with the given fabricated data:
         * Date Range of 2023-01-01 to 2024-01-01.
         * 60 frames.
         *
         * In this test we will provide the date 2023-07-01 to the animation controls (50% through the year).
         * We should expect it to set the frame count to 30, which is 50% of 60 frames.
         */
        let harness = RenderAnimationControls(
            [new Date("2023-01-01"), new Date("2024-01-01")],
            60
        );
        let progressBar = harness.render.getByLabelText("animation progress");
        // Initial settings should show the progress bar at initial value 0.
        // The max to be 60 frames, defined by GetMaxFrameCount
        // and the min to be 0.
        expect(progressBar.getAttribute("max")).toBe("60");
        expect(progressBar.getAttribute("min")).toBe("0");
        expect(progressBar.getAttribute("value")).toBe("0");

        // Update the animation date.
        // In the real application, this happens when the scene time is updated.
        act(() => {
            harness.UpdateAnimationDate(new Date("2023-07-01"));
        });
        // After setting the time, the min and max should be the same.
        // But the frame count should be 50% through the progress, since the date is 50% between the time range.
        expect(progressBar.getAttribute("max")).toBe("60");
        expect(progressBar.getAttribute("min")).toBe("0");
        expect(progressBar.getAttribute("value")).toBe("30");
    });

    it("Should not set the progressBar value below 0", () => {
        /**
         * Render the animation controls with the given fabricated data:
         * Date Range of 2023-01-01 to 2024-01-01.
         * 60 frames.
         *
         * In this test we will provide the date 2021-01-01, far before the range even starts.
         * We should expect it to set the frame count to 0.
         */
        let harness = RenderAnimationControls(
            [new Date("2023-01-01"), new Date("2024-01-01")],
            60
        );
        let progressBar = harness.render.getByLabelText("animation progress");
        // Initial settings should show the progress bar at initial value 0.
        // The max to be 60 frames, defined by GetMaxFrameCount
        // and the min to be 0.
        expect(progressBar.getAttribute("max")).toBe("60");
        expect(progressBar.getAttribute("min")).toBe("0");
        expect(progressBar.getAttribute("value")).toBe("0");

        // Update the animation date.
        // In the real application, this happens when the scene time is updated.
        act(() => {
            harness.UpdateAnimationDate(new Date("2021-01-01"));
        });
        // After setting the time, the min and max should be the same.
        // And the value should be 0.
        expect(progressBar.getAttribute("max")).toBe("60");
        expect(progressBar.getAttribute("min")).toBe("0");
        expect(progressBar.getAttribute("value")).toBe("0");
    });
});
