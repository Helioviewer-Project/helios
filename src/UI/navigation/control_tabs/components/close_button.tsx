import React from "react";
import css from "./close_button.css"

type CloseButtonProps = {
    onClose: () => void
}

export default function CloseButton({onClose}: CloseButtonProps) {
    return <button className={css.close_button} onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
    </button>
}