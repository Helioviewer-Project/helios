import React, { useState } from "react";
import Navbar from "./navbar";
import { DataControls } from "./control_tabs/data";
import AnimationControls from "./control_tabs/animation";
import { ModelInfo } from "../../common/types";
import LayerControls from "./control_tabs/layers";

type NavControlProps = {
    onAddData: (DataSource, DateRange) => void,
    /**
     * Current layers in the scene
     */
    Layers: ModelInfo[]
    /**
     * @returns Current time from the scene
     */
    GetSceneTime: () => Date,
    /**
     * @returns Gets a 2 element list with the first element being the earliest date in the scene, and max being the latest date in the scene
     */
    GetSceneTimeRange: () => Date[],
    /**
     * @returns Max frame count of all the sources in the scene
     */
    GetMaxFrameCount: () => number,
    /**
     * @returns Sets the time in the scene
     */
    SetSceneTime: (Date) => void
}

enum ControlTab {
    None,
    Data,
    Layers,
    Animation,
    Settings
}

export default function NavControls({
    onAddData,
    Layers,
    GetSceneTime,
    GetSceneTimeRange,
    GetMaxFrameCount,
    SetSceneTime
}: NavControlProps): React.JSX.Element[] {
    let [currentTab, setTab] = useState(ControlTab.None)
    function closeTabs() {
        setTab(ControlTab.None)
    }
    function selectTab(newTab: ControlTab) {
        if (currentTab === newTab) {
            closeTabs()
        } else {
            setTab(newTab)
        }
    }
    return [
        <Navbar key={0}
            onSelectData={() => selectTab(ControlTab.Data)}
            onSelectLayers={() => selectTab(ControlTab.Layers)}
            onSelectAnimation={() => selectTab(ControlTab.Animation)}/>,

        <DataControls
            key={1}
            onClose={closeTabs}
            visible={currentTab === ControlTab.Data}
            onAddData={onAddData}/>,

        <LayerControls
            key={2}
            visible={currentTab === ControlTab.Layers}
            onClose={closeTabs}
            Layers={Layers}/>,

        <AnimationControls
            key={3}
            onClose={closeTabs}
            visible={currentTab === ControlTab.Animation}
            GetSceneTime={GetSceneTime}
            GetSceneTimeRange={GetSceneTimeRange}
            GetMaxFrameCount={GetMaxFrameCount}
            SetSceneTime={SetSceneTime}/>,

        <div key={4}/>
    ]
}