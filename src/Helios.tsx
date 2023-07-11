import Scene from "./Scene/scene";
import { createRoot } from "react-dom/client";
import React from "react";
import NavControls from "./UI/navigation/controls";
import { GetImageScaleForResolution } from "./common/resolution_lookup.js";
import config from "./Configuration.js";
import TimeDisplay from "./UI/time_display.js";
import { DataSource, DateRange } from "./UI/navigation/control_tabs/data";
import { ModelInfo } from "./common/types";
import { LoadHelioviewerMovie } from "./UI/helioviewer_movie";
import AnimationControls from "./UI/video_player/animation";
import { Favorite, Favorites } from "./API/favorites";
import { Helios } from "./API/helios";
import { ExtraControls } from "./UI/extra_controls/extra_controls";

// /**
//  * When the page first loads, users should see something besides black, so load the first available image
//  */
// function LoadDefaultImage() {
//     // All the input fields are set to default values, so we can just click the "Load Image" button
//     HTML.add_source_btn.click();
// }

// LoadDefaultImage();

// Defined in main HTML, not React
const scene = new Scene("js-helios-viewport");
const FavoritesAPI = new Favorites(scene);

type AppState = {
    sceneTime: Date;
    layers: ModelInfo[];
    showVideoPlayer: boolean;
    favorites: Favorite[];
    recentlyShared: Favorite[];
};

/**
 * Entry point for the Helios app.
 * Intializes the scene, builds controls, and registers event handlers.
 */
class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);
        // Register the listener to update the React state any time the scene time changes.
        // This happens either from data loading or animation
        let firstRun = true;
        scene.RegisterTimeUpdateListener((newTime) => {
            if (firstRun) {
                this.state = {
                    sceneTime: newTime,
                    layers: [],
                    showVideoPlayer: true,
                    favorites: FavoritesAPI.GetFavorites(),
                    recentlyShared: [],
                };
                firstRun = false;
            } else {
                this.setState({ sceneTime: newTime });
            }
        });

        this.AddLayer = this.AddLayer.bind(this);
        this._LoadHelioviewerMovieFromQueryParameters();
        this._LoadRecentlyShared();
    }

    async _LoadRecentlyShared() {
        let shared = await Helios.GetRecentlyShared();
        this.setState({ recentlyShared: shared });
    }

    /**
     * Adds a new model layer to the current scene
     * @param source Source for the new layer
     * @param dateRange Range to import data over
     */
    async AddLayer(source: number, dateRange: DateRange) {
        if (dateRange.start > dateRange.end) {
            alert("Start time must be before end time");
        } else {
            let image_scale = GetImageScaleForResolution(
                config.default_texture_resolution,
                source
            );
            let layer = await scene.AddToScene(
                source,
                dateRange.start,
                dateRange.end,
                dateRange.cadence,
                image_scale,
                this.state.layers.length
            );
            this.setState({
                layers: this.state.layers.concat(layer),
            });
        }
    }

    RemoveLayer = (layerId: number) => {
        scene.RemoveFromScene(layerId);
        this.setState({
            // Remove the layer by filtering for all layers that don't match the id we're removing
            layers: this.state.layers.filter((val) => val.id != layerId),
        });
    };

    /**
     * If the query parameters match movie=string, then attempt to load the movie from that movie ID string.
     */
    _LoadHelioviewerMovieFromQueryParameters() {
        let params = new URLSearchParams(window.location.search);
        let movieId = params.get("movie");
        if (movieId != null) {
            LoadHelioviewerMovie(scene, movieId, (layer) => {
                this.setState({
                    layers: this.state.layers.concat(layer),
                });
            }).catch((e) => {
                alert("Unable to load movie from Helioviewer");
            });
        }
    }

    render(): React.ReactNode {
        return (
            <div>
                <TimeDisplay
                    time={this.state.sceneTime}
                    onTimeChange={(time) => scene.SetTime(time)}
                />
                <NavControls
                    onAddData={this.AddLayer}
                    Layers={this.state.layers}
                    GetSceneTime={() => scene.GetTime()}
                    GetSceneTimeRange={() => scene.GetTimeRange()}
                    GetMaxFrameCount={() => scene.GetMaxFrameCount()}
                    SetSceneTime={(date) => scene.SetTime(date)}
                    RegisterTimeListener={(fn) =>
                        scene.RegisterTimeUpdateListener(fn)
                    }
                    UnregisterTimeListener={(id) =>
                        scene.UnregisterTimeUpdateListener(id)
                    }
                    UpdateModelOpacity={(id, opacity) =>
                        scene.SetModelOpacity(id, opacity)
                    }
                    RemoveModel={this.RemoveLayer}
                    OnPlayerToggle={() => {
                        this.setState({
                            showVideoPlayer: !this.state.showVideoPlayer,
                        });
                    }}
                    favorites={this.state.favorites}
                    CreateFavorite={() => {
                        FavoritesAPI.AddFavorite();
                        this.setState({
                            favorites: FavoritesAPI.GetFavorites(),
                        });
                    }}
                    OnLoadFavorite={async (fav: Favorite) => {
                        let layerOrder = this.state.layers.length;
                        fav.layers.forEach(async (layer) => {
                            console.log(
                                "Adding layer with layerOrder " + layerOrder
                            );
                            let newLayer = await scene.AddToScene(
                                layer.source,
                                layer.start as Date,
                                layer.end as Date,
                                layer.cadence,
                                layer.scale,
                                layerOrder++
                            );
                            this.setState({
                                layers: this.state.layers.concat(newLayer),
                            });
                        });
                    }}
                    OnShareFavorite={async (fav: Favorite) => {
                        let id = await Helios.SaveScene(fav);
                        FavoritesAPI.FlagShared(fav);
                        this.setState({
                            favorites: FavoritesAPI.GetFavorites(),
                        });
                        this._LoadRecentlyShared();
                    }}
                    sharedScenes={this.state.recentlyShared}
                />
                <AnimationControls
                    visible={this.state.showVideoPlayer}
                    onClose={() => {}}
                    GetSceneTime={() => scene.GetTime()}
                    GetSceneTimeRange={() => scene.GetTimeRange()}
                    GetMaxFrameCount={() => scene.GetMaxFrameCount()}
                    SetSceneTime={(date) => scene.SetTime(date)}
                />
                <ExtraControls
                    OnResetCamera={() => {scene.ResetCamera()}}
                    />
            </div>
        );
    }
}

let root = createRoot(document.getElementById("app"));
root.render(<App />);
