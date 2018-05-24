<?php 
//code to adjust contrast based on:https://github.com/evanw/glfx.js/blob/master/src/filters/adjust/brightnesscontrast.js
//contrast can only be increased - if you need to decrease contrast you need to get the second part from above as well
//u_contrast - 0 to 1 (0 is no change, and 1 is maximum contrast)
//technically saturation and hue_rotation produce slightly different results than native canvas filters, but we are not
//going to worry about that right now, especially because the saturation change arguably looks better than native canvas
//saturation filter
?>
<script type="webgl/fragment-shader" id="webgl-fragment-canvas-filters">
precision mediump float;

varying vec2 v_texcoord;
uniform sampler2D u_texture;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_hue_rotation;

#{{hslFunctions}}
<?php //hue rotates around, so we subtract 1.0 so hue is always in range 0.0 - 1.0 ?>
float hue_rotate(float pixelHue, float hueRotation){
    return mod(pixelHue + hueRotation, 1.0);
}

void main(){
    #{{transparencyCheck}}

    vec3 adjustedPixel = pixel.rgb;
    <?php //adjust saturation and hue rotation ?>
    vec3 hsvPixel = rgb2hsv(adjustedPixel);
    adjustedPixel = hsv2rgb(vec3(hue_rotate(hsvPixel.r, u_hue_rotation), hsvPixel.g * u_saturation, hsvPixel.b));
    <?php //increase contrast - see note about decreasing contrast from above ?>
    adjustedPixel = (adjustedPixel - 0.5) / (1.0 - u_contrast) + 0.5;

    gl_FragColor = vec4(adjustedPixel, pixel.a);
    
}
</script>