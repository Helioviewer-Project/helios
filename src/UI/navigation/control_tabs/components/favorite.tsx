import React from "react";
import { Favorite } from "../../../../API/favorites";
import css from "./favorite.css";
import { GetSourceName } from "../../../../common/sources";
import { ToDateString } from "../../../../common/dates";

interface FavoriteProps {
    favorite: Favorite;
    controls?: React.JSX.Element;
}

export default function FavoriteComponent({
    favorite,
    controls,
}: FavoriteProps): React.JSX.Element {
    return (
        <>
            <table className={css.favorite}>
                <tbody>
                    <tr>
                        <td>Sources:</td>
                        <td>
                            <ul className={css.source_list}>
                                {favorite.layers.map((layer, i) => (
                                    <li key={i}>
                                        {GetSourceName(layer.source)}
                                    </li>
                                ))}
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
            <div className={css.controls}>{controls}</div>
            <hr className={css.divider} />
        </>
    );
}
