import React, { useState } from "react";
import Navbar from "./navbar";
import { DataControls } from "./control_tabs/data";
import AnimationControls from "./control_tabs/animation";

type NavControlProps = {
    onAddData: (DataSource, DateRange) => void,
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

        <DataControls onClose={closeTabs} visible={currentTab === ControlTab.Data} key={1} onAddData={onAddData}/>,

        <div key={2}/>,

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