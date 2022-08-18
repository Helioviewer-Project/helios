import {
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    ShaderMaterial
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

	vec2 uv = normalize( vNormal ).xy * 0.41 + 0.5;

	vec3 color = texture2D( tex, uv ).rgb;

	gl_FragColor = vec4( color, 1.0 );

}`;



async function CreateHemisphereWithTexture(texture) {
    const geometry = await LoadMesh('./resources/models/sun_model.stl');

    let uniforms = {
		"tex": { value: texture }
	};

	// material
	let material = new ShaderMaterial( {
		uniforms		: uniforms,
		vertexShader	: vertex_shader,
		fragmentShader	: fragment_shader
	} );
    const sphere = new Mesh( geometry, material );
    return sphere;
}

export {
    CreateHemisphereWithTexture
};
