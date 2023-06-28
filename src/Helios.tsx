import Scene from './Scene/scene';
import { createRoot } from 'react-dom/client';
import React from 'react';
import NavControls from './UI/navigation/controls';
import { GetImageScaleForResolution } from './common/resolution_lookup.js';
import config from './Configuration.js';
import TimeDisplay from './UI/time_display.js';
import { DataSource, DateRange } from './UI/navigation/control_tabs/data';
import { ModelInfo } from './common/types';

// /**
//  * When the page first loads, users should see something besides black, so load the first available image
//  */
// function LoadDefaultImage() {
//     // All the input fields are set to default values, so we can just click the "Load Image" button
//     HTML.add_source_btn.click();
// }

// LoadDefaultImage();

// Defined in main HTML, not React
const scene = new Scene('js-helios-viewport');

type AppState = {
    sceneTime: Date,
    layers: ModelInfo[]
}

/**
 * Entry point for the Helios app.
 * Intializes the scene, builds controls, and registers event handlers.
 */
class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);
        // Register the listener to update the React state any time the scene time changes.
        // This happens either from data loading or animation
        let firstRun = true
        scene.RegisterTimeUpdateListener((newTime) => {
            if (firstRun) {
                this.state = {
                    sceneTime: newTime,
                    layers: []
                }
                firstRun = false
            } else {
                this.setState({sceneTime: newTime})
            }
        })

        this.AddLayer = this.AddLayer.bind(this);
    }

    /**
     * Adds a new model layer to the current scene
     * @param source Source for the new layer
     * @param dateRange Range to import data over
     */
    async AddLayer(source: DataSource, dateRange: DateRange) {
        if (dateRange.start > dateRange.end) {
            alert('Start time must be before end time');
        } else {
            let image_scale = GetImageScaleForResolution(config.default_texture_resolution, source.value);
            let layer = await scene.AddToScene(source.value, dateRange.start, dateRange.end, dateRange.cadence, image_scale, 1);
            this.setState({
                layers: this.state.layers.concat(layer)
            })
        }
    }

    render(): React.ReactNode {
        return (
            <div>
                <TimeDisplay time={this.state.sceneTime} onTimeChange={time => scene.SetTime(time)} />
                <NavControls
                    onAddData={this.AddLayer}
                    Layers={this.state.layers}
                    GetSceneTime={() => scene.GetTime()}
                    GetSceneTimeRange={() => scene.GetTimeRange()}
                    GetMaxFrameCount={() => scene.GetMaxFrameCount()}
                    SetSceneTime={(date) => scene.SetTime(date)}
                    RegisterTimeListener={(fn) => scene.RegisterTimeUpdateListener(fn)}
                    UpdateModelOpacity={(id, opacity) => scene.SetModelOpacity(id, opacity)}/>
            </div>
        )
    }
}

let root = createRoot(document.getElementById('app'));
root.render(<App />)