import React, { useState } from "react";
import css from "./common.css";
import preferencesCss from "./preferences.css";
import CloseButton from "./components/close_button";
import Select from "@UI/components/input/select";
import { Preferences } from "@API/preferences";

type PreferenceControlProps = {
    visible: boolean;
    onClose: () => void;
};

const resolutionOptions = [
    { label: "Lowest (Fastest: 256x256)", value: 256 },
    { label: "Low (Fast: 512x512)", value: 512 },
    { label: "Medium (1k)", value: 1024 },
    { label: "High (slow: 2k)", value: 2048 },
    { label: "Best (slowest: 4k)", value: 4096 },
];

export default function PreferenceControls(
    props: PreferenceControlProps
): React.JSX.Element {
    const visibilityClass = props.visible ? css.visible : css.invisible;
    const [resolution, setResolution] = useState(Preferences.resolution);
    return (
        <div
            tabIndex={-1}
            aria-hidden={props.visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={props.onClose} />
            <Select
                className={preferencesCss.option}
                label="Resolution"
                value={resolution}
                onChange={(value: string) => {
                    let res = parseInt(value);
                    setResolution(res);
                    Preferences.resolution = res;
                }}
                options={resolutionOptions.map((val) => (
                    <option key={val.value} value={val.value}>
                        {val.label}
                    </option>
                ))}
                title="Determines the image resolution to use for rendering. Higher resolutions will require more bandwidth and will take longer to load. The app may crash on devices which can't support the higher resolutions."
            />
        </div>
    );
}
