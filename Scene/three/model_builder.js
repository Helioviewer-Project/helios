import {
    SphereGeometry,
    PlaneGeometry,
    MeshBasicMaterial,
    Mesh,
    ShaderMaterial,
    Vector2,
    Matrix4,
    Group,
    BackSide
} from 'three';

import {LoadMesh} from './mesh_loader.js';
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

    return sphere_group;
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
    return group;
}

/**
 * Updates a model's texture on the fly
 * @param {Group} group 3js object group containing the sun models
 * @param {Texture} texture New texture to apply
 * @param {JP2info} jp2info
 */
function UpdateModelTexture(group, texture, jp2info, source) {
    // Iterate through the group and update the texture uniform.
    for (const model of group.children) {
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
        sub_model.material.uniforms.opacity.value = opacity;
    }
}

/**
 * Updates the layering order of the given model
 * @param {number} order Effectize "Z-index" of the model
 */
function UpdateModelLayeringOrder(model, order) {
    for (const child of model.children) {
        child.material.polygonOffset = true;
        child.material.polygonOffsetUnits = -order * 1000000;
    }
}

export {
    CreateHemisphereWithTexture,
    CreatePlaneWithTexture,
    UpdateModelTexture,
    UpdateModelOpacity,
    UpdateModelLayeringOrder
};
