import React from "react";
import common from "./common.css";
import css from "./favorites.css";
import CloseButton from "./components/close_button";
import { Favorite } from "../../../API/favorites";
import TextButton from "../../components/button/TextButton";
import FavoriteComponent from "./components/favorite";
import IconButton from "../../components/button/IconButton";

interface FavoritesControlsProps {
    visible: Boolean;
    favorites: Favorite[];
    onClose: () => void;
    onAddFavorite: () => void;
    onLoadFavorite: (fav: Favorite) => void;
    onShareFavorite: (fav: Favorite) => void;
}

function FavoritesControls(props: FavoritesControlsProps): React.JSX.Element {
    const visibilityClass = props.visible ? common.visible : common.invisible;
    return (
        <div
            aria-hidden={props.visible ? "false" : "true"}
            className={`${common.tab} ${visibilityClass}`}
        >
            <CloseButton onClose={props.onClose} />
            <div className={css.input}>
                <TextButton text="Save Current View" onClick={() => {
                    props.onAddFavorite();
                }} />
            </div>
            <div className={css.separator}>
                <hr style={{width: "100%"}}/>
                <p>Favorites History</p>
            </div>
            <div className={css.container}>
                {props.favorites.map((fav, i) => <FavoriteComponent
                    key={i}
                    favorite={fav}
                    controls={<>
                        <IconButton icon="add" text="Load" onClick={() => props.onLoadFavorite(fav)} />
                        <IconButton icon="cloud_upload" disabled={fav.shared} text={fav.shared ? "Already Shared" : "Share"} onClick={() => props.onShareFavorite(fav)} />
                    </>}
                    />)}
                {props.favorites.length == 0 ? <p>You don't have any favorites yet</p> : <></>}
            </div>
        </div>
    );
}

export { FavoritesControls };
