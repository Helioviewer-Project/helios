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

const imageFormatOptions = ["jpg", "png", "webp"];

export default function PreferenceControls(
    props: PreferenceControlProps
): React.JSX.Element {
    const visibilityClass = props.visible ? css.visible : css.invisible;
    const [resolution, setResolution] = useState(Preferences.resolution);
    const [imageFormat, setImageFormat] = useState(Preferences.imageFormat);
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
                title="Higher resolutions will require more bandwidth and will take longer to load. The app may crash on devices which can't support the higher resolutions."
            />

            <Select
                className={preferencesCss.option}
                label="Format"
                value={imageFormat}
                onChange={(value: string) => {
                    setImageFormat(value);
                    Preferences.imageFormat = value;
                }}
                options={imageFormatOptions.map((val) => (
                    <option key={val} value={val}>
                        {val}
                    </option>
                ))}
                title="JPG typically provides the best compression/bandwidth ratio. WEBP is sometimes better than JPG, but not always. PNG is lossless and will use the most bandwidth."
            />
        </div>
    );
}
