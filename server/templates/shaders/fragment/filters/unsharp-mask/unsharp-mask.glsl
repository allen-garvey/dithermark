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


//  * @filter         Unsharp Mask
//  * @description    A form of image sharpening that amplifies high-frequencies in the image. It is implemented by scaling pixels away from the average of their neighbors.
//  * Blurred texture is the result of triangle blur
//  * @param u_strength A scale factor where 0 is no effect and higher values cause a stronger effect.


in vec2 v_texcoord;
out vec4 output_color;

uniform sampler2D u_blurred_texture;
uniform sampler2D u_texture;
uniform float u_strength;

void main() {
    vec4 blurred = texture(u_blurred_texture, v_texcoord);
    vec4 original = texture(u_texture, v_texcoord);
    output_color = mix(blurred, original, 1.0 + u_strength);
}