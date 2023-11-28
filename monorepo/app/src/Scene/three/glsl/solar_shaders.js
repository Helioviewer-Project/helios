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

// scale is used to define the scale of the mesh in relation to the texture. Used to get
// the image of the sun to fit "just right" onto the hemisphere
uniform float scale;

// currently unused, can be used to shift the texture in the x axis
uniform float x_offset;

// currently unused, can be used to shift the texture in the y axis
uniform float y_offset;

// If red/green/blue values are all below this threshold, then the pixel
// will become transparent
uniform float transparent_threshold;

// flag to determine if the model we're mapping onto is the front or back side of the model
// (this application technically loads 2 models, one for front and one for back, this shader
//  treats each slightly different)
uniform bool backside;

// Sets the opacity of the texture
uniform float opacity;

// v_uv is the uv we're working on, received from the vertex shader.
// varying means it is a variable coming from the vertex shader.
// as opposed to uniform, which means it is a global constant.
varying vec2 v_uv;

void main() {
    // I stumbled upon this function, but haven't analyzed it much. But it allows me to scale the
    // the mesh against the texture coordinates so that the uv coordinates map to a different part
    // of the mesh, as if it was scaled.
    vec2 scaled_uv = (vec2(v_uv.x + x_offset, v_uv.y + y_offset) - vec2(0.5)) * scale + vec2(0.5);
    // For reasons unknown (probably blender) the x is flipped, so flip it back here.
    scaled_uv.x = 1.0 - scaled_uv.x;

    if (scaled_uv.x > 1.0 || scaled_uv.y > 1.0 || scaled_uv.x < 0.0 || scaled_uv.y < 0.0) {
        discard;
    }

    // Get the color of this coordinate in the texture
    vec4 color = vec4(texture2D(tex, scaled_uv).rgb, opacity);

    // Using the equation of a circle here with an origin at (0.5, 0.5) i.e. center of the mesh
    // and a radius of 0.25 (quarter of the mesh, see resources/models/dimensions.png). Any
    // value greater than the radius is outside the circle, and therefore outside the hemisphere.
    bool is_outside_hemisphere = (pow(0.5 - v_uv.x, 2.0) + pow(0.5 - v_uv.y, 2.0)) > 0.0625;

    if (is_outside_hemisphere) {
        // Black is vec3(0, 0, 0) all values are from 0 to 1.
        // x, y, z -> red, green, blue
        // If all three color values are below this threshold, then make them transparent.
        // then change the color to transparent. If any color is above the threshold, then don't change it
        // use the color sampled from the texture.
        bool should_be_transparent = color.x < transparent_threshold && color.y < transparent_threshold && color.z < transparent_threshold;
        if (should_be_transparent) {
            discard;
        }
    }

    // For the backside render, hide the hemisphere of the sun, but leave everything else the same.
    // This will give the JHelioviewer effect of off-disk emissions.
    if (backside && !is_outside_hemisphere) {
        // transparent
        color = vec4(0, 0, 0, 0);
    }

    // Update the output color to what we've calculated above.
	gl_FragColor = color;

    // Uncomment this line below to visualize the UVs
    // gl_FragColor = vec4(v_uv.x, v_uv.y, 0, 1);

    // Uncomment this line to see the texture unmodified
	// gl_FragColor = vec4(texture2D(tex, scaled_uv).rgb, 1.0);
}`;

export { vertex_shader, fragment_shader };
