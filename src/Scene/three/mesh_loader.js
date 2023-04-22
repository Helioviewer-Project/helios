import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {Matrix4} from 'three';

/**
 * Keep one loader initialized.
 * @private
 */
let stlloader = new STLLoader();
let gltfloader = new GLTFLoader();

/**
 * Cache for meshes so that the same ones aren't reloaded
 * every time they're needed
 * @private
 */
let cache = {};

/**
 * Searches a gltf for a mesh to use.
 * @param {GLTF} gltf object loaded with the GLTFLoader
 * @returns {Geometry} the geometry to use
 * @private
 */
function _ExtractMeshFromGLTF(gltf) {
    let mesh;
    gltf.scene.traverse( function ( child ) {
        if ( child.isMesh ) {
            //Setting the buffer geometry
            mesh = child.geometry;
        }
    } );

    // Flip the geometry so the front of the sun is the front.
    // Without this, threejs thinks the flat side is the front.
    mesh.applyMatrix4( new Matrix4().makeRotationX( Math.PI ) );
    return mesh;
}

/**
 * Loads an STL mesh from the given path
 *
 * @param {string} path Path to the stl file, relative to site root.
 */
function LoadMesh(path) {
    if (cache.hasOwnProperty(path)) {
        return cache[path];
    } else {
        // Choose loader to use
        let loader = gltfloader;
        if (path.endsWith("stl")) {
            loader = stlloader;
        }

        return new Promise((resolve, reject) => {
            loader.load(path,
            // on success
            (geometry) => {
                if (loader == gltfloader) {
                    geometry = _ExtractMeshFromGLTF(geometry);
                }
                cache[path] = geometry;
                resolve(geometry);
            },
            // onProgress is not supported by threejs
            undefined,
            // on error
            (result) => reject(result));
        });
    }
}

export { LoadMesh };

