import React, { useState } from "react";
import Navbar from "./navbar";
import { DataControls } from "./control_tabs/data";

type NavControlProps = {
    onAddData: (DataSource, DateRange) => void
}

enum ControlTab {
    None,
    Data,
    Animation,
    Settings
}

export default function NavControls({
    onAddData
}: NavControlProps): React.JSX.Element[] {
    let [currentTab, setTab] = useState(ControlTab.None)
    return [
        <Navbar key={0}
            onSelectData={() => setTab(ControlTab.Data)}
            onSelectAnimation={() => setTab(ControlTab.Animation)}
            onSelectSettings={() => setTab(ControlTab.Settings)} />,
        <DataControls visible={currentTab === ControlTab.Data} key={1} onAddData={onAddData}/>,
        <div key={2}/>,
        <div key={3}/>
    ]
}