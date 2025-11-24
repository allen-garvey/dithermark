#version 300 es
precision highp float;

//unsharp mask adapted from: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/unsharpmask.js

/*
Copyright (C) 2011 by Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// In glfx.js triangle blur is applied before the unsharp mask. Since we don't need the triangle blur on its own, we are combining it here into one big combined shader.

//  * @filter       Triangle Blur
//  * @description  This is the most basic blur filter, which convolves the image with a pyramid filter. The pyramid filter is separable and is applied as two perpendicular triangle filters.
//  * @param u_radius The radius of the pyramid convolved with the image.

//  * @filter         Unsharp Mask
//  * @description    A form of image sharpening that amplifies high-frequencies in the image. It is implemented by scaling pixels away from the average of their neighbors.
//  * Blurred texture is the result of triangle blur
//  * @param u_strength A scale factor where 0 is no effect and higher values cause a stronger effect.


in vec2 v_texcoord;
out vec4 output_color;

uniform sampler2D u_texture;
uniform float u_strength;
uniform vec2 u_radius;

float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main() {
    // triangle blur
    vec4 blurred_color = vec4(0.0);
    float total = 0.0;
    
    // randomize the lookup values to hide the fixed number of samples
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    
    for (float t = -30.0; t <= 30.0; t++) {
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec4 current_sample = texture(u_texture, v_texcoord + u_radius * percent);
        
        // switch to pre-multiplied alpha to correctly blur transparent images
        current_sample.rgb *= current_sample.a;
        
        blurred_color += current_sample * weight;
        total += weight;
    }
    
    blurred_color = blurred_color / total;
    
    // switch back from pre-multiplied alpha
    blurred_color.rgb /= blurred_color.a + 0.00001;

    // unsharp mask
    vec4 original = texture(u_texture, v_texcoord);
    output_color = mix(blurred_color, original, 1.0 + u_strength);
}