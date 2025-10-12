#version 300 es
precision mediump float;

//code to adjust contrast based on:https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/brightnesscontrast.js
//u_contrast -1 to 2 (-1 is solid gray, 0 is no change, and 2 is maximum contrast)
//technically saturation and hue_rotation produce slightly different results than native canvas filters, but we are not
//going to worry about that right now, especially because the saturation change arguably looks better than native canvas
//saturation filter and eventually, all browser will probably support native filters anyway
//
//brightness code simplified version of https://stackoverflow.com/questions/1506299/applying-brightness-and-contrast-with-opengl-es
//u_brightness >=0, where 1 is unchanged

in vec2 v_texcoord;
out vec4 output_color;
uniform sampler2D u_texture;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_brightness;
uniform float u_hue_rotation;

#{{hsvFunctions}}

//hue rotates around, so we subtract 1.0 so hue is always in range 0.0 - 1.0 
float hue_rotate(float pixelHue, float hueRotation) {
    return mod(pixelHue + hueRotation, 1.0);
}

void main() {
    vec4 pixel = texture(u_texture, v_texcoord);

    vec3 adjustedPixel = pixel.rgb;

    //adjust saturation and hue rotation
    vec3 hsvPixel = rgb2hsv(adjustedPixel);
    adjustedPixel = hsv2rgb(vec3(hue_rotate(hsvPixel.r, u_hue_rotation), hsvPixel.g * u_saturation, hsvPixel.b));

    //contrast
    if(u_contrast >= 0.0) {
        adjustedPixel = (adjustedPixel - 0.5) / (1.0 - u_contrast) + 0.5;
    } else {
        adjustedPixel = (adjustedPixel - 0.5) * (1.0 + u_contrast) + 0.5;
    }

    //brightness
    adjustedPixel *= u_brightness;

    output_color = vec4(adjustedPixel, pixel.a);

}