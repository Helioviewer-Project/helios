import React from "react";
import common from "./common.css";
import css from "./favorites.css";
import CloseButton from "./components/close_button";
import { Favorite } from "../../../API/favorites";
import TextButton from "../../components/button/TextButton";
import IconButton from "../../components/button/IconButton";
import { GetSourceName } from "../../../common/sources";
import { ToDateString } from "../../../common/dates";

interface FavoritesControlsProps {
    visible: Boolean;
    favorites: Favorite[];
    onClose: () => void;
    onAddFavorite: () => void;
    onLoadFavorite: (fav: Favorite) => void;
    onShareFavorite: (fav: Favorite) => void;
}

interface FavoriteProps {
    favorite: Favorite;
    onLoadFavorite: (fav: Favorite) => void;
    onShareFavorite: (fav: Favorite) => void;
}

function FavoriteComponent({favorite, onLoadFavorite, onShareFavorite}: FavoriteProps): React.JSX.Element {
    return <><table className={css.favorite}>
        <tbody>
        <tr>
            <td>Sources:</td>
            <td>
                <ul className={css.source_list}>
                    {favorite.layers.map((layer, i) => <li key={i}>{GetSourceName(layer.source)}</li>)}
                </ul>
            </td>
        </tr>
        <tr>
            <td>From:</td>
            <td>{ToDateString(favorite.start)}</td>
        </tr>
        <tr>
            <td>To:</td>
            <td>{ToDateString(favorite.end)}</td>
        </tr>
        </tbody>
    </table>
    <div className={css.controls}>
        <IconButton icon="add" text="Load" onClick={() => onLoadFavorite(favorite)} />
        <IconButton icon="cloud_upload" text="Share" onClick={() => onShareFavorite(favorite)} />
    </div>
    <hr className={css.divider} />
    </>
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
                    onLoadFavorite={props.onLoadFavorite}
                    onShareFavorite={props.onShareFavorite}
                    />)}
                {props.favorites.length == 0 ? <p>You don't have any favorites yet</p> : <></>}
            </div>
        </div>
    );
}

export { FavoritesControls };
