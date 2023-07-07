import React from "react";
import css from "./common.css";
import CloseButton from "./components/close_button";
import { Favorite } from "../../../API/favorites";
import FavoriteComponent from "./components/favorite";
import IconButton from "../../components/button/IconButton";

type SharedControlProps = {
    visible: boolean;
    onClose: () => void;
    sharedItems: Favorite[];
    onLoadSharedItem: (fav: Favorite) => void;
};

export default function SharedControls(props: SharedControlProps): React.JSX.Element {
    const visibilityClass = props.visible ? css.visible : css.invisible;
    return (
        <div
            tabIndex={-1}
            aria-hidden={props.visible ? "false" : "true"}
            className={`${css.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={props.onClose} />
            {props.sharedItems.length == 0 ? <p>Nothing to see here.<br/>Try sharing something from your favorites</p> : <></>}
            {props.sharedItems.map((fav: Favorite, i) =>
                <FavoriteComponent
                    key={i}
                    favorite={fav}
                    controls={<>
                        <IconButton icon="add" text="Load" onClick={() => props.onLoadSharedItem(fav)} />
                    </>}
            />)}
        </div>
    );
}
