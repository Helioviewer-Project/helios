import React, { useEffect, useState } from "react";
import Navbar from "./navbar";
import { RangeControls } from "./control_tabs/range_controls";
import { DateRange, ModelInfo } from "../../common/types";
import LayerControls from "./control_tabs/layers";
import { FavoritesControls } from "./control_tabs/favorites";
import { Favorite } from "../../API/favorites";
import SharedControls from "./control_tabs/shared_controls";
import { OpenInJHelioviewer } from "@common/jhelioviewer";
import { IsJhvRunning } from "jhvrequest";
import PreferenceControls from "./control_tabs/preference_controls";

type NavControlProps = {
    /**
     * Current layers in the scene
     */
    Layers: ModelInfo[];
    /**
     * @returns Current time from the scene
     */
    GetSceneTime: () => Date;
    /**
     * @returns Gets a 2 element list with the first element being the earliest date in the scene, and max being the latest date in the scene
     */
    GetSceneTimeRange: () => Date[];
    /**
     * @returns Max frame count of all the sources in the scene
     */
    GetMaxFrameCount: () => number;
    /**
     * @returns Sets the time in the scene
     */
    SetSceneTime: (Date) => void;
    /**
     * Registers a callback to execute when the scene is updated
     * @param fn Callback to execute whene date changes
     */
    RegisterTimeListener: (fn: (Date) => void) => number;
    UnregisterTimeListener: (number: number) => void;
    UpdateModelOpacity: (id: number, opacity: number) => void;
    RemoveModel: (id: number) => void;
    /** The movie player button is special. It sends toggle events to show/hide the video player */
    OnPlayerToggle: () => void;
    /** List of favorites */
    favorites: Favorite[];
    /** Executed when user requests to add a new favorite */
    CreateFavorite: () => void;
    OnLoadFavorite: (fav: Favorite) => void;
    OnShareFavorite: (fav: Favorite) => void;
    sharedScenes: Favorite[];
    /** The application level date range being observed */
    dateRange: DateRange;
    SetDateRange: (DateRange) => void;
    /** Add a new layer to the scene */
    AddLayer: (sourceId: number) => void;
};

enum ControlTab {
    None,
    Range,
    Layers,
    Animation,
    Settings,
    Favorites,
    Preferences,
    Cloud,
}

export default function NavControls({
    Layers,
    GetSceneTime,
    GetSceneTimeRange,
    GetMaxFrameCount,
    SetSceneTime,
    RegisterTimeListener,
    UnregisterTimeListener,
    UpdateModelOpacity,
    RemoveModel,
    OnPlayerToggle,
    favorites,
    CreateFavorite,
    OnLoadFavorite,
    OnShareFavorite,
    sharedScenes,
    dateRange,
    SetDateRange,
    AddLayer,
}: NavControlProps): React.JSX.Element[] {
    let [currentTab, setTab] = useState(ControlTab.None);
    let [showJhvButton, setShowJhvButton] = useState(false);
    useEffect(() => {
        // Check if JHelioviewer becomes active
        setInterval(async () => {
            setShowJhvButton(await IsJhvRunning());
        }, 5000);
    }, []);
    function closeTabs() {
        setTab(ControlTab.None);
    }
    function selectTab(newTab: ControlTab) {
        if (currentTab === newTab) {
            closeTabs();
        } else {
            setTab(newTab);
        }
    }
    return [
        <Navbar
            key={0}
            isActive={currentTab != ControlTab.None}
            onSelectRange={() => selectTab(ControlTab.Range)}
            onSelectLayers={() => selectTab(ControlTab.Layers)}
            onSelectFavorite={() => selectTab(ControlTab.Favorites)}
            onSelectCloud={() => selectTab(ControlTab.Cloud)}
            onSelectPreferences={() => {
                selectTab(ControlTab.Preferences);
            }}
            showJhvButton={showJhvButton}
            openInJhelioviewer={() => OpenInJHelioviewer(Layers)}
        />,

        <RangeControls
            key={1}
            onClose={closeTabs}
            visible={currentTab === ControlTab.Range}
            dateRange={dateRange}
            setDateRange={SetDateRange}
        />,

        <LayerControls
            key={2}
            visible={currentTab === ControlTab.Layers}
            onClose={closeTabs}
            Layers={Layers}
            RegisterTimeListener={RegisterTimeListener}
            UnregisterTimeListener={UnregisterTimeListener}
            UpdateModelOpacity={UpdateModelOpacity}
            RemoveModel={RemoveModel}
            AddLayer={AddLayer}
        />,

        <FavoritesControls
            key={3}
            visible={currentTab === ControlTab.Favorites}
            onClose={closeTabs}
            favorites={favorites}
            onAddFavorite={CreateFavorite}
            onLoadFavorite={OnLoadFavorite}
            onShareFavorite={OnShareFavorite}
        />,

        <SharedControls
            key={4}
            visible={currentTab === ControlTab.Cloud}
            onClose={closeTabs}
            sharedItems={sharedScenes}
            onLoadSharedItem={OnLoadFavorite}
        />,

        <PreferenceControls
            key={5}
            visible={currentTab === ControlTab.Preferences}
            onClose={closeTabs}
        />,
    ];
}
