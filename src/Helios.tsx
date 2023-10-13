import Scene from "./Scene/scene";
import { createRoot } from "react-dom/client";
import React from "react";
import NavControls from "./UI/navigation/controls";
import { GetImageScaleForResolution } from "./common/resolution_lookup.js";
import config from "./Configuration.js";
import TimeDisplay from "./UI/time_display.js";
import { DateRange, ModelInfo } from "./common/types";
import { LoadHelioviewerMovie } from "./UI/helioviewer_movie";
import AnimationControls from "./UI/video_player/animation";
import { Favorite, Favorites } from "./API/favorites";
import { Helios } from "./API/helios";
import { ExtraControls } from "./UI/extra_controls/extra_controls";
import { InitializeAssets } from "./Assets/RegisteredAssets";

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
InitializeAssets(scene);

const FavoritesAPI = new Favorites(scene);

function getDefaultDateRange(): DateRange {
    let now = new Date();
    let yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    let cadence = 86400;
    return {
        start: yesterday,
        end: now,
        cadence: cadence,
    };
}

type AppState = {
    sceneTime: Date;
    layers: ModelInfo[];
    showVideoPlayer: boolean;
    favorites: Favorite[];
    recentlyShared: Favorite[];
    dateRange: DateRange;
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
                    dateRange: getDefaultDateRange(),
                };
                firstRun = false;
            } else {
                this.setState({ sceneTime: newTime });
            }
        });

        this.AddLayer = this.AddLayer.bind(this);
        this.ApplyNewDateRange = this.ApplyNewDateRange.bind(this);
        this._LoadHelioviewerMovieFromQueryParameters();
        this._LoadRecentlyShared();
    }

    async _LoadRecentlyShared() {
        let shared = await Helios.GetRecentlyShared();
        this.setState({ recentlyShared: shared });
    }

    async ApplyNewDateRange(range: DateRange) {
        // Update the state with the new range
        this.setState({ dateRange: range });
        // Update all layers with the new range.
        this.state.layers.forEach(async (model) => {
            console.log(`Adding new layer to replace id ${model.id}`);
            // Add existing layers with the new date range.
            this.AddLayer(model.source, range, () => {
                this.RemoveLayer(model.id);
            });
        });
    }

    /**
     * Adds a new model layer to the current scene
     * @param source Source for the new layer
     * @param dateRange Range to import data over
     * @param cb Callback executed after state is updated with the new layer.
     */
    async AddLayer(
        source: number,
        dateRange: DateRange,
        cb: () => void = () => {}
    ) {
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
            console.log(`Adding layer with id ${layer.id}`);
            this.setState(
                {
                    layers: this.state.layers.concat(layer),
                },
                cb
            );
        }
    }

    RemoveLayer(layerId: number) {
        console.log(`Deleting layer ${layerId} from scene`);
        scene.RemoveFromScene(layerId);
        this.setState({
            // Remove the layer by filtering for all layers that don't match the id we're removing
            layers: this.state.layers.filter((val) => val.id != layerId),
        });
    }

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
                    CreateFavorite={async () => {
                        let thumbnail = await scene.CreateThumbnail();
                        FavoritesAPI.AddFavorite(thumbnail);
                        this.setState({
                            favorites: FavoritesAPI.GetFavorites(),
                        });
                    }}
                    OnLoadFavorite={async (fav: Favorite) => {
                        let layerOrder = this.state.layers.length;
                        fav.layers.forEach(async (layer) => {
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
                    dateRange={this.state.dateRange}
                    SetDateRange={(newRange) =>
                        this.ApplyNewDateRange(newRange)
                    }
                    AddLayer={(sourceId: number) =>
                        this.AddLayer(sourceId, this.state.dateRange)
                    }
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
                    OnResetCamera={() => {
                        scene.ResetCamera();
                    }}
                    TakeScreenshot={() => {
                        scene.TakeScreenshot();
                    }}
                    ToggleAxes={() => scene.ToggleAxesHelper()}
                />
            </div>
        );
    }
}

let root = createRoot(document.getElementById("app"));
root.render(<App />);
