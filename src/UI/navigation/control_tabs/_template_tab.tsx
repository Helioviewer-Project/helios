import React from "react";
import css from "./common.css";
import CloseButton from "./components/close_button";

type TemplateProps = {
    visible: boolean;
    onClose: () => void;
};

export default function TemplateTab(props: TemplateProps): React.JSX.Element {
    const visibilityClass = props.visible ? css.visible : css.invisible;
    return (
        <div
            tabIndex={-1}
            aria-hidden={props.visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={props.onClose} />
        </div>
    );
}
