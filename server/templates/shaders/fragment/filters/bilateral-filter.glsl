precision mediump float;

//bilateral filter adapted from: https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/denoise.js

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

// @filter         Denoise
// @description    Smooths over grainy noise in dark images using an 9x9 box filter weighted by color intensity, similar to a bilateral filter. Works best to run filter twice for better results.
// @param u_exponent The exponent of the color intensity difference, should be greater than zero. A value of zero just gives an 9x9 box blur and high values give the original image, but ideal values are usually around 10-20.
// Also note that it doesn't need a transparency check, since it handles transparency fine.

varying vec2 v_texcoord;
uniform sampler2D u_texture;
uniform float u_exponent;
uniform vec2 u_image_dimensions;
void main() {
    vec4 center = texture2D(u_texture, v_texcoord);
    vec4 color = vec4(0.0);
    float total = 0.0;
    for(float x = -4.0; x <= 4.0; x += 1.0) {
        for(float y = -4.0; y <= 4.0; y += 1.0) {
            vec4 sample = texture2D(u_texture, v_texcoord + vec2(x, y) / u_image_dimensions);
            float weight = 1.0 - abs(dot(sample.rgb - center.rgb, vec3(0.25)));
            weight = pow(weight, u_exponent);
            color += sample * weight;
            total += weight;
        }
    }
    gl_FragColor = color / total;
}
