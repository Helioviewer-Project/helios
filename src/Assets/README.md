# Assets

As we add more data, we'll need to formalize how new data sources are added to allow the application to scale to new data as desired.
These are some musings on how we can make assets work like plugins.

Assets are intended to be a "drop-in" style of plugin.
Folders registered in the assets folder should be more or less autoloaded, though we may maintain a list of manual metadata that will be parsed to load new assets.
Potentially this list could live in the Config file.

Having a way to drop-in new assets is intended to ease development of adding new data sources to the application.
By enforcing a strict asset interface, we prevent the need to manually integrate each asset into the application.

## High Leven Design (informal)

This still needs to be fleshed out, but at this time the idea goes something like this:

-   Specify a new asset in the configuration file.
-   Create an asset loader that parses asset metadata from the config file.
-   Asset Loader will execute an asset initialization function
-   When user clicks "Add Source" or "Add Data" All assets should be notified (or only selected assets?)
-   Each asset will presumably have a unique asset loader to query its data, and some asset-specific code for processing into scene coordinates.
-   Each asset must define metadata that will be shown in the asset UI
    -   We'll have to define a schema or API.

### Asset Loader Interface

The asset loader is the entry point for new assets.
At a minimum it should include these three functions.

-   AddTimeSeries(start, end, cadence, scene)

    -   This assumes time series data. Load the asset and add it to the scene.
    -   Returns ID representing the added asset

-   GetAssociatedSources()

    -   Returns a list of sourceIds that must be present for this asset to be loaded.

-   enabled
    -   Settable property used to enable/disable further loading of assets by this loader.

### Asset Interface

The Asset Interface is required to make sure all assets respond appropriately.
Its modeled after the initial Model class used for rendering the sun.

-   SetTime(date, scene)
    -   Sets the current scene time. The asset should use this to update its current representation since it most likely holds time series data.
    -   The scene is provided in case assets have more complicated asset handling and need direct scene access to manage rendering.
-   GetRenderableModel()
    -   Each scene should maintain its own model group or "subscene" so to speak.
        This is the instance that is added to the scene being rendered.
-   Remove()
    -   Should clean up and remove all associated textures and threejs objects and completely remove this asset from the scene.
-   GetTitle()
    -   Return the name of this asset to display in the UI
-   GetDate()
    -   Return the current time being rendered by this asset

# Example

The magnetic field asset is intended to be a prototype of how this asset interface could work.
