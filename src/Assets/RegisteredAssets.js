/**
 * Each import in this file registers an asset on the scene.
 * Each loader must have a constructor which executes `Scene.RegisterAssetLoader` with a function to the actual loading function.
 * The loading function must meet the specification defined in the README in this folder.
 * The loading function must be async
 */
import { FieldLoader } from "./MagneticField/FieldLoaderGong.js";

function InitializeAssets(scene) {
    scene.RegisterAssetLoader(new FieldLoader());
}

export { InitializeAssets };
