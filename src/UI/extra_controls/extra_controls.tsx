import React from "react";
import css from "./extra_controls.css";
import IconButton from "../components/button/IconButton";

interface ExtraControlsProps {
    OnResetCamera: () => void;
    TakeScreenshot: () => void;
}

function ExtraControls(props: ExtraControlsProps): React.JSX.Element {
    return (
        <div className={css.controls}>
            <IconButton
                icon="cameraswitch"
                altText="Reset camera"
                onClick={props.OnResetCamera}
            />
            <IconButton
                icon="capture"
                altText="Take screenshot"
                onClick={props.TakeScreenshot}
            />
        </div>
    );
}

export { ExtraControls };
