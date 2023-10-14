import React, { useState } from "react";
import DateRangePicker from "./components/date_range_picker";
import css from "./common.css";
import CloseButton from "./components/close_button";
import { DateRange } from "../../../common/types";
import TextButton from "../../components/button/TextButton";
import { ToDateString } from "../../../common/dates";

type DataControlsProps = {
    visible: boolean;
    onClose: () => void;
    dateRange: DateRange;
    setDateRange: (DateRange) => void;
};

function RangeControls({
    visible,
    onClose,
    dateRange,
    setDateRange,
}: DataControlsProps): React.JSX.Element {
    const visibilityClass = visible ? css.visible : css.invisible;
    let [tmpDateRange, setTmpDateRange] = useState<DateRange>(dateRange);
    return (
        <div
            aria-hidden={visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={onClose} />
            <DateRangePicker value={tmpDateRange} setValue={setTmpDateRange} />
            <TextButton
                text="Apply"
                onClick={() => setDateRange(tmpDateRange)}
            />
            <table>
                <tbody>
                    <tr>
                        <td>Start:</td>
                        <td>{ToDateString(dateRange.start)}</td>
                    </tr>
                    <tr>
                        <td>End:</td>
                        <td>{ToDateString(dateRange.end)}</td>
                    </tr>
                    <tr>
                        <td>Steps:</td>
                        <td>
                            {Math.round(
                                (1 / (dateRange.cadence * 1000)) *
                                    (dateRange.end.getTime() -
                                        dateRange.start.getTime())
                            )}{" "}
                            steps
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export { RangeControls, DateRange };
