<?php 
//used to add outline around images
//based on https://github.com/evanw/glfx.js/blob/master/src/filters/fun/edgework.js

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

//@param u_strength (value from 0-1 that is then prepared by Math.pow(strength, 5) * 100,000.0)
?>
<script type="webgl/fragment-shader" id="webgl-fragment-image-edge-filter-base">
    precision mediump float;

    uniform sampler2D u_texture;
    uniform float u_strength;
    uniform vec2 u_image_dimensions;
    varying vec2 v_texcoord;

    #{{customDeclaration}}
    
    void main(){
        #{{transparencyCheck}}

        vec2 dx = vec2(1.0 / u_image_dimensions.x, 0.0);
        vec2 dy = vec2(0.0, 1.0 / u_image_dimensions.y);
        float bigTotal = 0.0;
        float smallTotal = 0.0;
        vec3 bigAverage = vec3(0.0);
        vec3 smallAverage = vec3(0.0);
        for (float x = -2.0; x <= 2.0; x += 1.0) {
            for (float y = -2.0; y <= 2.0; y += 1.0) {
                vec3 sample = texture2D(u_texture, v_texcoord + dx * x + dy * y).rgb;
                bigAverage += sample;
                bigTotal += 1.0;
                if (abs(x) + abs(y) < 2.0) {
                    smallAverage += sample;
                    smallTotal += 1.0;
                }
            }
        }
        vec3 edge = max(vec3(0.0), bigAverage / bigTotal - smallAverage / smallTotal);
        vec3 edgeDiff = pixel.rgb - dot(edge, edge) * u_strength;
        
        if(max(max(edgeDiff.r, edgeDiff.g), edgeDiff.b) <= 0.0){
            gl_FragColor = #{{customOutlineColor}}
        }
        else{
            gl_FragColor = vec4(0.0);    
        }
    }
</script>
<script type="webgl/fragment-shader" id="webgl-fragment-image-edge-filter-declaration-fixed">
    uniform vec3 u_outline_color;
</script>
<script type="webgl/fragment-shader" id="webgl-fragment-image-edge-filter-declaration-background">
    uniform sampler2D u_background_texture;
    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];

    #{{lightnessFunction}}
    #{{hslFunctions}}
    #{{distanceFunction}}

    <?php //find closest color to backgroundPixel that is darker to use for outline color ?>
    vec3 get_dark_outline_color(vec3 backgroundPixel){
        vec3 outlineColor = backgroundPixel;
        float backgroundLightness = lightness(backgroundPixel);
        
        <?php //arbitrarily large number ?>
        float shortestDistance = 99999.99;
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(backgroundPixel, currentColor);
            if(lightness(currentColor) < backgroundLightness && currentDistance < shortestDistance){
                shortestDistance = currentDistance;
                outlineColor = currentColor;
            }
        }

        return outlineColor;
    }
</script>
<script type="webgl/fragment-shader" id="webgl-fragment-image-edge-filter-color-fixed">
    vec4(u_outline_color, 1.0);
</script>
<script type="webgl/fragment-shader" id="webgl-fragment-image-edge-filter-color-background">
    vec4(get_dark_outline_color(texture2D(u_background_texture, v_texcoord).rgb), 1.0);
</script>