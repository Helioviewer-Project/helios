import React from "react";
import css from "./navbutton.css";

type NavbuttonProps = {
    onClick: () => void;
    /** Either a material icon name or a URL to an image */
    icon: string;
    text: string;
    title?: string;
    /** only display if item is visible is true */
    visible?: boolean;
};

/**
 * Mobile/Desktop navbar with icons
 */
export default function NavButton({
    onClick,
    icon,
    text,
    title = null,
    visible = true,
}: NavbuttonProps): JSX.Element {
    if (visible) {
        if (icon.startsWith("http")) {
            var icon_span = <img className={css.icon} src={icon} alt={text} />;
        } else {
            var icon_span = (
                <span className={css.icon + " material-symbols-outlined "}>
                    {icon}
                </span>
            );
        }

        return (
            <button className={css.button} onClick={onClick} title={title}>
                {icon_span}
                <span className={css.text}>{text}</span>
            </button>
        );
    } else {
        return <></>;
    }
}
