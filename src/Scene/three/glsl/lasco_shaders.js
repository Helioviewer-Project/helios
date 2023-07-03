/**
 * A vertex shader in the graphics pipeline determines
 * where each vertex should be placed in 3D space. It is executed for each vertex in a 3D model (mesh).
 * gl_Position is the output variable that has the vertex's position
 * position is the initial position of the vertex.
 * There's nothing special about this vertex shader.
 * This is the default function to position the mesh in the scene.
 * The projectionMatrix and modelViewMatrix are defined by 3js and this formula
 * positions the mesh in the scene wherever it's supposed to be according to the camera position.
 * @private
 */
let vertex_shader = `
// v_uv is used to pass the vertex information on to the fragment shader
varying vec2 v_uv;

void main() {
    // uv is a global passed to the vertex shader, not sure why it's not passed automatically
    // to the fragment shader, where I actually need it.
    v_uv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

/**
 * The fragment shader (or pixel shader) runs for every pixel that should be rendered on a mesh.
 * It uses UV coordinates (uv is denotes the xy axes, but xy is not used because they're already
 * used to describe the axes in a 3D model). UV coordinates are 2 dimensional coordinates that map
 * to a point in a 3D model.
 *
 * UV coordinates are passed in a range from 0 to 1. (0,0) being the bottom left corner and (1,1)
 * being the uppermost right corner. The 3D model itself defines how these coordinates map to 3D space.
 * See uv_map.png in the resources/models folder.
 * @private
 */
let fragment_shader = `
/* uniforms are global variables that can be passed to this shader program via 3js. */

// tex is the 3D texture, in this case the image of the sun we are mapping to the model
uniform sampler2D tex;

// currently unused, can be used to shift the texture in the x axis
uniform float x_offset;

// currently unused, can be used to shift the texture in the y axis
uniform float y_offset;

// Sets the opacity of the texture
uniform float opacity;

// v_uv is the uv we're working on, received from the vertex shader.
// varying means it is a variable coming from the vertex shader.
// as opposed to uniform, which means it is a global constant.
varying vec2 v_uv;

void main() {
    // For reasons unknown (probably blender) the x is flipped, so flip it back here.
    // v_uv.x = 1.0 - v_uv.x;

    if (v_uv.x > 1.0 || v_uv.y > 1.0 || v_uv.x < 0.0 || v_uv.y < 0.0) {
        discard;
    }

    // Get the color of this coordinate in the texture
    vec4 color = vec4(texture2D(tex, v_uv).rgb, opacity);

    // Black is vec3(0, 0, 0) all values are from 0 to 1.
    // x, y, z -> red, green, blue
    // If all three color values are below this threshold, then make them transparent.
    // then change the color to transparent. If any color is above the threshold, then don't change it
    // use the color sampled from the texture.
    float transparent_threshold = 0.10f;
    bool should_be_transparent = color.x < transparent_threshold && color.y < transparent_threshold && color.z < transparent_threshold;
    if (should_be_transparent) {
        discard;
    }

    // Update the output color to what we've calculated above.
	gl_FragColor = color;
}`;

export { vertex_shader, fragment_shader };
