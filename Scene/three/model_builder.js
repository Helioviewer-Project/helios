import {
    SphereGeometry,
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    ShaderMaterial,
    Vector2,
    Matrix4,
    Group,
    BackSide,
    DoubleSide
} from 'three';

import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";


import {LoadMesh} from './mesh_loader.js';
import {LoadFont} from './font_loader.js';
import {
    vertex_shader as SolarVertexShader,
    fragment_shader as SolarFragmentShader
} from './glsl/solar_shaders.js';
import {
    vertex_shader as LascoVertexShader,
    fragment_shader as LascoFragmentShader
} from './glsl/lasco_shaders.js';
import Config from '../../Configuration.js';

/**
 * Creates a flat plane that represents the backside of the sun.
 * This side will have only the energy coming off of the sun rendered on it.
 * @param {Texture} texture Sun image texture
 * @returns {Mesh}
 * @private
 */
async function _GetBackside(texture, scale) {
    // Load the mesh
    let geometry = await LoadMesh('./resources/models/sun_model.gltf');

    // Create the shader, this is where the uniforms that appear
    // in the shader are set.
    let shader = new ShaderMaterial({
        uniforms: {
            tex: {value: texture},
            scale: {value: scale},
            x_offset: {value: 0.0},
            y_offset: {value: 0.0},
            backside: {value: true},
            opacity: {value: 1},
            transparent_threshold: {value: 0.05}
        },
        vertexShader: SolarVertexShader,
        fragmentShader: SolarFragmentShader
    });
    // Enable transparency, without this, making pixels transparent will
    // just make them white.
    shader.transparent = true;
    // Set the shader to apply to the backside, by default it only applies
    // to the front side.
    shader.side = BackSide;
    // Construct the mesh and return it.
    const backside = new Mesh( geometry, shader );
    return backside;
}

/**
 * Creates a hemisphere with the given texture applied
 * @param {Texture} texture
 * @param {JP2info} jp2 metadata about this texture for positioning
 */
async function CreateHemisphereWithTexture(texture, jp2info) {
    let scale = _ComputeMeshScale(jp2info);
    // Load the backside of the mesh in parallel
    // Load the model
    let geometry = await LoadMesh('./resources/models/sun_model.gltf');

    // Create the shader, this is where the uniforms that appear
    // in the shader are set.
    let shader = new ShaderMaterial({
        uniforms: {
            tex: {value: texture},
            scale: {value: scale},
            x_offset: {value: 0.0},
            y_offset: {value: 0.0},
            backside: {value: false},
            opacity: {value: 1},
            transparent_threshold: {value: 0.05}
        },
        vertexShader: SolarVertexShader,
        fragmentShader: SolarFragmentShader
    });
    // Enable transparency, without this, making pixels transparent will
    // just make them white.
    shader.transparent = true;
    // Construct the 3js mesh
    const sphere = new Mesh( geometry, shader );
    const backside = await _GetBackside(texture, scale);
    // Construct the backside of the mesh
    // Add both sphere and backside models to a group, so all operations
    // to the group apply to everything inside.
    const sphere_group = new Group();
    sphere_group.add(sphere);
    sphere_group.add(await backside);
    // Set the scale, this isn't strictly necessary, but keeps our camera position
    // closer to the origin. Something something about render distance consuming more
    // compute cycles. I don't know if this actually improves performance or not
    sphere_group.scale.set(0.20, 0.20, 0.20);
    sphere_group.type = "sun";

    return sphere_group;
}

/**
 * Creates a hemisphere with the given texture applied
 */
async function CreateHemisphere() {
    let geometry = await LoadMesh('./resources/models/sun_model.gltf');
    let material = new MeshBasicMaterial();
    material.opacity = 0;
    material.transparent = true;
    material.polygonOffset = true;
    material.polygonOffsetUnits = 0xffffffff;
    material.polygonOffsetFactor = 0xffffffff; 
    let mesh = new Mesh(geometry, material);
    mesh.scale.set(0.2, 0.2, 0.2);
    return mesh;
}


/**
 * Gets the dimensions of a flat plane according to the jp2info
 * @param {JP2Info} jp2info
 * @returns {Object} Object with width, height fields.
 */
function _getPlaneDimensionsFromJp2Info(jp2info) {
    let x_scale = jp2info.width / jp2info.solar_radius;
    let y_scale = jp2info.height / jp2info.solar_radius;
    let width = x_scale * 5;
    let height = y_scale * 5;
    return {
        width: width,
        height: height
    };
}

async function CreatePlaneWithTexture(texture, jp2info) {
    let dimensions = _getPlaneDimensionsFromJp2Info(jp2info);
    const geometry = new PlaneGeometry(dimensions.width, dimensions.height);
    let shader = new ShaderMaterial({
        uniforms: {
            tex: {value: texture},
            x_offset: {value: 0.0},
            y_offset: {value: 0.0},
            opacity: {value: 1},
        },
        vertexShader: LascoVertexShader,
        fragmentShader: LascoFragmentShader
    });
    shader.transparent = true;
    const mesh = new Mesh(geometry, shader);
    // API expects all meshes to be groups, so add this mesh to a single group
    const group = new Group();
    group.add(mesh);
    group.type = "sun";
    return group;
}

async function CreateText(text) {
    let font = await LoadFont("/resources/fonts/helvetiker_regular.typeface.json");
    const geometry = new TextGeometry(text, {
        font: font,
		size: 80,
		height: 5,
		curveSegments: 12,
		bevelEnabled: true,
		bevelThickness: 10,
		bevelSize: 8,
		bevelOffset: 0,
		bevelSegments: 5
    });

    const material = new MeshBasicMaterial();
    const mesh = new Mesh(geometry, material);
    mesh.scale.set(0.01, 0.01, 0.01);
    mesh.type = "text";
    return mesh;
}

function CreateMarkerModel(_, text) {
    const geometry = new SphereGeometry( 0.2, 32, 16);
    const material = new MeshBasicMaterial( { color: 0xffff00 } );
    const sphere = new Mesh( geometry, material );
    sphere.type = "marker";
    return sphere;
}

/*
function CreateMarkerModel(texture, text) {
    // TODO: make this more generic.
    // The 78/46 are the dimensions of the active region marker, this makes the plane that's created
    // the correct size so that the active region image is shown in the correct dimenions (no scaling to fit the mesh).
    // const geometry = new PlaneGeometry( 2, 78/46 * 2 );
    const geometry = new PlaneGeometry( 1, 1);
    const material = new MeshBasicMaterial( {map: texture, side: DoubleSide} );
    material.transparent = true;
    // TODO: Investigate if these can be removed.
    // Since polygon offsets are used to make sure certain images show up on top of others, this is here so that the
    // marker is always in front of everything.
    material.polygonOffset = true;
    material.polygonOffsetUnits = -999 * 1000000;
    const plane = new Mesh( geometry, material );

    CreateText(text).then((text_mesh) => {
        plane.add(text_mesh);
    });
    plane.type = "marker";
    return plane;
}
*/

/**
 * Updates a model's texture on the fly
 * @param {Group} group 3js object group containing the sun models
 * @param {Texture} texture New texture to apply
 * @param {JP2info} jp2info
 */
function UpdateModelTexture(group, texture, jp2info, source) {
    // Iterate through the group and update the texture uniform.
    for (const model of group.children) {
        if (model.material.hasOwnProperty('uniforms')) {
            model.material.uniforms.tex.value = texture;
            if (Config.plane_sources.indexOf(source) != -1) {
                let dimensions = _getPlaneDimensionsFromJp2Info(jp2info);
                model.geometry.width = dimensions.width;
                model.geometry.height = dimensions.height;
                model.updateMatrix();
            } else {
                model.material.uniforms.scale.value = _ComputeMeshScale(jp2info);
            }
        }
    }
}

/**
 * Computes the scale of the mesh to pass into the fragment shader
 * so that the texture fits in the correct spot on the mesh.
 * @param {JP2info} jp2info
 * @returns {number}
 * @private
 */
function _ComputeMeshScale(jp2info) {
    // Currently assumes the sun is always centered in the image.
    // if it's not, this code will need to be updated to handle those offsets
    let diameter = jp2info.solar_radius * 2;
    let sun_image_ratio = diameter / jp2info.width;
    let target_width_ratio = 0.5;
    // We need the hemisphere on the mesh (which is 50% (0.5) of the width)
    // to be the same as the width of the sun in the texture so that it fits perfectly
    // To achieve this we take the width of the sun relative to the width of the image, and create
    // a multiplier so that the with of the hemisphere matches the width of the sun relative to
    // the width of the mesh.
    return sun_image_ratio / target_width_ratio;
}

/**
 * Sets the opacity on all model groups
 * @param {Group} model Model group returned by CreateHemisphereWithTexture
 */
function UpdateModelOpacity(model, opacity) {
    for (const sub_model of model.children) {
        if (sub_model.material.hasOwnProperty("uniforms")) {
            sub_model.material.uniforms.opacity.value = opacity;
        }
    }
}

function _IsSolarModel(model) {
    return model.type == "sun";
}

function _IsMarkerModel(model) {
    return model.type == "marker";
}

/**
 * Updates the layering order of the given model
 * @param {number} order Effectize "Z-index" of the model
 */
function UpdateModelLayeringOrder(model, order) {
    if (_IsSolarModel(model)) {
        model.children[0].material.polygonOffset = true;
        model.children[0].material.polygonOffsetUnits = (order - 1) * -1000;
        model.children[0].material.polygonOffsetFactor = (order - 1) * -1;
        model.children[1].material.polygonOffset = true;
        model.children[1].material.polygonOffsetFactor = (order - 1) * 2;
        model.children[1].material.polygonOffsetUnits = (order - 1) * 1000;
    } else if (_IsMarkerModel(model)) {
        model.material.polygonOffset = true;
        model.material.polygonOffsetUnits = (order - 1) * 1000;
        model.material.polygonOffsetFactor = (order - 1) * 1;
    }
}

/**
 * Frees a mesh's geometry and material
 */
function _FreeMesh(mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
}

/**
 * Frees a model group
 * @private
 */
function _FreeGroup(group) {
    for (const model of group.children) {
        FreeModel(model);
    }
}

/**
 * API for freeing a model created with one of the model builder functions
 * @param {Object} object 
 */
function FreeModel(object) {
    if (object.type == "Group") {
        _FreeGroup(object);
    } else if (object.type == "Mesh") {
        _FreeMesh(object);
    }
}

export {
    CreateHemisphereWithTexture,
    CreatePlaneWithTexture,
    CreateMarkerModel,
    CreateHemisphere,
    UpdateModelTexture,
    UpdateModelOpacity,
    UpdateModelLayeringOrder,
    FreeModel
};
