import React from "react";
import css from "./IconButton.css";

interface IconButtonProps {
    icon: string;
    text?: string;
    className?: string;
    style?: Object | null;
    onClick: () => void;
}

export default function IconButton(props: IconButtonProps) {
    return (
        <button style={props.style} className={`${css.button} ${props.className}`} onClick={props.onClick}>
            <span className={css.icon + " material-symbols-outlined "}>
                {props.icon}
            </span>
            {props.text != null ? <span>{props.text}</span> : <></>}
        </button>
    );
}
