import {
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    ShaderMaterial,
    Vector2
} from 'three';

import {LoadMesh} from './mesh_loader.js';

// See this fiddle for details
// https://jsfiddle.net/31o0zn2c/
let vertex_shader = `
varying vec3 vNormal;

void main() {

	vNormal = normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

let fragment_shader = `
uniform sampler2D tex;

varying vec3 vNormal;

void main() {

	vec2 uv = normalize( vNormal ).xy;

	vec3 color = texture2D( tex, uv ).rgb;

	gl_FragColor = vec4( color, 1.0 );

}`;

/**
 * Creates a hemisphere with the given texture applied
 * @param {Texture} texture
 */
async function CreateHemisphereWithTexture(texture) {
    // TODO: Get pimple mesh
    let geometry = await LoadMesh('./resources/models/sun_model.gltf');

    texture.center = new Vector2(0.5, 0.5);
    texture.repeat.set(1.49, 1.49);
    let basicmaterial = new MeshBasicMaterial({map: texture});
    const sphere = new Mesh( geometry, basicmaterial );
    return sphere;
}

/**
 * Updates a model's texture on the fly
 * @param {Model} model 3js object model
 * @param {Texture} texture New texture to apply
 */
function UpdateModelTexture(model, texture) {
    texture.center = new Vector2(0.5, 0.5);
    texture.repeat.set(1.49, 1.49);
    model.material.map = texture;
}

export {
    CreateHemisphereWithTexture,
    UpdateModelTexture
};
