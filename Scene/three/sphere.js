import {
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
    ShaderMaterial
} from 'three';

// See this fiddle for details
// https://jsfiddle.net/31o0zn2c/
/** @private */
let vertex_shader = `
varying vec3 vNormal;

void main() {

	vNormal = normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}`;

/** @private */
let fragment_shader = `
uniform sampler2D tex;

varying vec3 vNormal;

void main() {

	vec2 uv = normalize( vNormal ).xy * 0.41 + 0.5;

	vec3 color = texture2D( tex, uv ).rgb;

	gl_FragColor = vec4( color, 1.0 );

}`;

/**
 * Returns a hemisphere with the given image applied as a texture
 * @param {Texture} texture 3js texture to apply to the hemisphere
 */
function CreateHemisphereWithTexture(texture) {
    const geometry = new SphereGeometry(1, 32, 32, 0, 2*Math.PI, 0, Math.PI/2);
    const material = new MeshBasicMaterial({
        map: texture
    });
    const sphere = new Mesh( geometry, material );
    return sphere;
}

export {
    CreateHemisphereWithTexture
};
